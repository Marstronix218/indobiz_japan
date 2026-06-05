import { getServiceClient, hasSupabaseConfig } from "@/lib/supabase/client"
import type { FeedbackGateOutput } from "@/lib/llm"

const FEEDBACK_TABLE = "article_feedback"
const AMENDMENTS_TABLE = "prompt_amendments"

/**
 * Hard cap on simultaneously-active amendments. Bounds prompt growth and blast
 * radius: once at the cap, the oldest amendment is retired as a new one lands.
 */
const MAX_ACTIVE_AMENDMENTS = 12

export interface InsertFeedbackArgs {
  articleId: string
  userId: string | null
  message: string
  gate: FeedbackGateOutput
}

export interface InsertFeedbackResult {
  feedbackId: string | null
  amendmentApplied: boolean
}

/**
 * Persist the feedback row and, when the gate accepted a generalizable
 * improvement, append its amendment to the active set (auto-applied on the next
 * pipeline run). Fails soft: a storage error never surfaces to the reader as a
 * hard failure beyond the caller's own handling.
 */
export async function recordFeedback(
  args: InsertFeedbackArgs,
): Promise<InsertFeedbackResult> {
  const { articleId, userId, message, gate } = args
  const client = getServiceClient()

  const { data: feedbackRow, error: feedbackError } = await client
    .from(FEEDBACK_TABLE)
    .insert({
      article_id: articleId,
      user_id: userId,
      message,
      gate_verdict: gate.verdict,
      gate_category: gate.category,
      gate_score: gate.score,
      gate_reason: gate.reason,
    })
    .select("id")
    .single()

  if (feedbackError) {
    console.error("[feedback] failed to insert feedback row:", feedbackError)
    return { feedbackId: null, amendmentApplied: false }
  }

  const feedbackId = (feedbackRow as { id: string }).id

  if (!gate.amendment) {
    return { feedbackId, amendmentApplied: false }
  }

  const amendmentApplied = await appendAmendment(
    client,
    gate.amendment,
    feedbackId,
  )

  return { feedbackId, amendmentApplied }
}

async function appendAmendment(
  client: ReturnType<typeof getServiceClient>,
  text: string,
  feedbackId: string,
): Promise<boolean> {
  // Skip exact duplicates already active — avoids the same guidance piling up.
  const { data: existing, error: existingError } = await client
    .from(AMENDMENTS_TABLE)
    .select("id, text, created_at")
    .eq("active", true)
    .order("created_at", { ascending: true })

  if (existingError) {
    console.error("[feedback] failed to read active amendments:", existingError)
    return false
  }

  const active = (existing ?? []) as { id: string; text: string }[]
  if (active.some((a) => a.text.trim() === text.trim())) {
    return false
  }

  const { data: inserted, error: insertError } = await client
    .from(AMENDMENTS_TABLE)
    .insert({
      text,
      active: true,
      source: "auto-feedback",
      source_feedback_id: feedbackId,
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("[feedback] failed to insert amendment:", insertError)
    return false
  }

  // Link the feedback row back to the amendment it produced.
  await client
    .from(FEEDBACK_TABLE)
    .update({ amendment_id: (inserted as { id: string }).id })
    .eq("id", feedbackId)

  // Enforce the cap by retiring the oldest active amendments.
  const overflow = active.length + 1 - MAX_ACTIVE_AMENDMENTS
  if (overflow > 0) {
    const toRetire = active.slice(0, overflow).map((a) => a.id)
    const { error: retireError } = await client
      .from(AMENDMENTS_TABLE)
      .update({ active: false })
      .in("id", toRetire)
    if (retireError) {
      console.error("[feedback] failed to retire old amendments:", retireError)
    }
  }

  return true
}

let cachedAmendments: Promise<string[]> | null = null

/**
 * Active amendment texts to append to the synthesis system prompt. Memoized per
 * process so a single pipeline run issues one query. Fails open (empty list).
 */
export function getActivePromptAmendments(): Promise<string[]> {
  if (!hasSupabaseConfig()) return Promise.resolve([])
  if (cachedAmendments) return cachedAmendments

  cachedAmendments = (async () => {
    try {
      const { data, error } = await getServiceClient()
        .from(AMENDMENTS_TABLE)
        .select("text")
        .eq("active", true)
        .order("created_at", { ascending: true })
      if (error) {
        console.error("[feedback] failed to load prompt amendments:", error)
        return []
      }
      return ((data ?? []) as { text: string }[])
        .map((r) => r.text?.trim())
        .filter((t): t is string => Boolean(t))
    } catch (error) {
      console.error("[feedback] prompt amendments lookup threw:", error)
      return []
    }
  })()

  return cachedAmendments
}
