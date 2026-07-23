import "server-only"

import {
  evaluateBetaAccess,
  type BetaAccessEvaluation,
  type BetaAccessRecord,
} from "@/lib/beta-access"
import { getServiceClient } from "@/lib/supabase/client"

const BETA_ACCESS_SELECT = [
  "user_id",
  "trial_started_at",
  "survey_completed_at",
  "extension_started_at",
  "extension_expires_at",
].join(",")

interface BetaAccessRow {
  user_id: string
  trial_started_at: string
  survey_completed_at: string | null
  extension_started_at: string | null
  extension_expires_at: string | null
}

export interface UserBetaAccess {
  record: BetaAccessRecord
  evaluation: BetaAccessEvaluation
}

export type BetaExtensionResult =
  | "success"
  | "not_ready"
  | "already_used"
  | "unavailable"

function rowToRecord(row: BetaAccessRow): BetaAccessRecord {
  return {
    trialStartedAt: row.trial_started_at,
    surveyCompletedAt: row.survey_completed_at,
    extensionStartedAt: row.extension_started_at,
    extensionExpiresAt: row.extension_expires_at,
  }
}

async function loadBetaAccessRow(userId: string): Promise<BetaAccessRow | null> {
  const { data, error } = await getServiceClient()
    .from("beta_access")
    .select(BETA_ACCESS_SELECT)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw error
  return data as BetaAccessRow | null
}

/**
 * Starts the trial on the user's first authenticated site access. No anonymous
 * browser timestamp is imported or trusted.
 */
export async function ensureUserBetaAccess(
  userId: string,
): Promise<UserBetaAccess | null> {
  try {
    let row = await loadBetaAccessRow(userId)

    if (!row) {
      const { data, error } = await getServiceClient()
        .from("beta_access")
        .insert({ user_id: userId })
        .select(BETA_ACCESS_SELECT)
        .single()

      if (error) {
        // Two simultaneous first requests can race on the primary key. The
        // winning insert is authoritative, so re-read after a duplicate.
        if (error.code !== "23505") throw error
        row = await loadBetaAccessRow(userId)
      } else {
        row = data as unknown as BetaAccessRow
      }
    }

    if (!row) return null
    const record = rowToRecord(row)
    return { record, evaluation: evaluateBetaAccess(record) }
  } catch (error) {
    console.error(
      "[supabase] ensureUserBetaAccess failed:",
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

/**
 * Redeems the single extension atomically in Postgres. The RPC uses the
 * database clock and refuses early or repeated redemption.
 */
export async function redeemUserBetaExtension(
  userId: string,
): Promise<BetaExtensionResult> {
  try {
    const { data, error } = await getServiceClient().rpc(
      "redeem_beta_extension",
      { p_user_id: userId },
    )

    if (error) throw error
    if (
      data === "success" ||
      data === "not_ready" ||
      data === "already_used"
    ) {
      return data
    }
    return "unavailable"
  } catch (error) {
    console.error(
      "[supabase] redeemUserBetaExtension failed:",
      error instanceof Error ? error.message : String(error),
    )
    return "unavailable"
  }
}
