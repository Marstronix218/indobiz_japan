export const BETA_INITIAL_ACCESS_DAYS = 14
export const BETA_EXTENSION_ACCESS_DAYS = 14
export const BETA_DAY_MS = 24 * 60 * 60 * 1000

export type BetaAccessPhase =
  | "initial_access"
  | "survey_required"
  | "extension_access"
  | "expired"

export interface BetaAccessRecord {
  trialStartedAt: string
  surveyCompletedAt?: string | null
  extensionStartedAt?: string | null
  extensionExpiresAt?: string | null
}

export interface BetaAccessEvaluation {
  phase: BetaAccessPhase
  hasFullAccess: boolean
  shouldOfferSurvey: boolean
  extensionHasBeenUsed: boolean
  accessUntil: string | null
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : null
}

/**
 * Evaluates a database-backed beta period using an injected clock. Database
 * timestamps, rather than browser storage or the device clock, are the source
 * of truth in production.
 */
export function evaluateBetaAccess(
  record: BetaAccessRecord,
  now = Date.now(),
): BetaAccessEvaluation {
  const trialStartedAt = parseTimestamp(record.trialStartedAt)
  const extensionStartedAt = parseTimestamp(record.extensionStartedAt)
  const extensionExpiresAt = parseTimestamp(record.extensionExpiresAt)
  const extensionHasBeenUsed =
    extensionStartedAt !== null || extensionExpiresAt !== null

  if (extensionHasBeenUsed) {
    if (extensionExpiresAt !== null && now < extensionExpiresAt) {
      return {
        phase: "extension_access",
        hasFullAccess: true,
        shouldOfferSurvey: false,
        extensionHasBeenUsed: true,
        accessUntil: new Date(extensionExpiresAt).toISOString(),
      }
    }

    return {
      phase: "expired",
      hasFullAccess: false,
      shouldOfferSurvey: false,
      extensionHasBeenUsed: true,
      accessUntil: null,
    }
  }

  if (trialStartedAt === null) {
    return {
      phase: "expired",
      hasFullAccess: false,
      shouldOfferSurvey: false,
      extensionHasBeenUsed: false,
      accessUntil: null,
    }
  }

  const initialAccessUntil =
    trialStartedAt + BETA_INITIAL_ACCESS_DAYS * BETA_DAY_MS

  if (now < initialAccessUntil) {
    return {
      phase: "initial_access",
      hasFullAccess: true,
      shouldOfferSurvey: false,
      extensionHasBeenUsed: false,
      accessUntil: new Date(initialAccessUntil).toISOString(),
    }
  }

  return {
    phase: "survey_required",
    hasFullAccess: false,
    shouldOfferSurvey: true,
    extensionHasBeenUsed: false,
    accessUntil: null,
  }
}
