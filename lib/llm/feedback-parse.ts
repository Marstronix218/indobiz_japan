import { extractJsonObject } from "./parse"
import {
  LLMError,
  type FeedbackCategory,
  type FeedbackGateOutput,
  type FeedbackVerdict,
} from "./types"

const CATEGORIES: FeedbackCategory[] = [
  "actionable",
  "destructive",
  "incorrect",
  "spam",
  "not_prompt_related",
]

const AMENDMENT_MAX_CHARS = 160

export function parseFeedbackGateOutput(raw: string): FeedbackGateOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (error) {
    throw new LLMError("フィードバック審査応答のJSONパースに失敗", error)
  }

  if (!parsed || typeof parsed !== "object") {
    throw new LLMError("フィードバック審査応答がオブジェクトではありません")
  }

  const obj = parsed as Record<string, unknown>
  const verdict = normalizeVerdict(obj.verdict)
  const category = normalizeCategory(obj.category)
  const score = normalizeScore(obj.score)
  const reason = typeof obj.reason === "string" ? obj.reason.trim() : ""

  let amendment: string | null = null
  if (typeof obj.amendment === "string") {
    const trimmed = obj.amendment.trim()
    amendment = trimmed.length > 0 ? trimmed.slice(0, AMENDMENT_MAX_CHARS) : null
  }

  // Safety net: an amendment is only ever applied on ACCEPT + actionable.
  // If the model contradicts itself, drop the amendment rather than risk it.
  if (verdict !== "ACCEPT" || category !== "actionable") {
    amendment = null
  }

  return { verdict, category, score, reason, amendment }
}

function normalizeVerdict(value: unknown): FeedbackVerdict {
  if (typeof value !== "string") {
    throw new LLMError("フィードバック審査応答に verdict がありません")
  }
  const upper = value.trim().toUpperCase()
  if (upper === "ACCEPT" || upper === "REJECT") return upper
  throw new LLMError(`フィードバック審査応答の verdict が不正: ${value}`)
}

function normalizeCategory(value: unknown): FeedbackCategory {
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase() as FeedbackCategory
    if (CATEGORIES.includes(lower)) return lower
  }
  // Unknown category → treat conservatively as spam (won't produce amendment).
  return "spam"
}

function normalizeScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}
