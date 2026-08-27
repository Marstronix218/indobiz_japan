import { timingSafeEqual } from "node:crypto"

export const LINE_CAMPAIGN_CLAIM = "indobiz_line_campaign"

export function hasLineCampaignAccess(user: {
  app_metadata?: Record<string, unknown> | null
  user_metadata?: Record<string, unknown> | null
} | null | undefined): boolean {
  return (
    user?.app_metadata?.[LINE_CAMPAIGN_CLAIM] === true ||
    user?.app_metadata?.indobiz_line_verified === true
  )
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase()
}

export function isValidLineCampaignCode(
  candidate: string,
  expected: string,
): boolean {
  const left = Buffer.from(normalizeCode(candidate))
  const right = Buffer.from(normalizeCode(expected))
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right)
}
