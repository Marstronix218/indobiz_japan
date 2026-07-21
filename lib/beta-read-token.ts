import { createHmac, timingSafeEqual } from "node:crypto"
import { BETA_READ_QUALIFY_MS } from "./beta-config.ts"

const TOKEN_MAX_AGE_MS = 60 * 60 * 1000

interface BetaReadTokenPayload {
  userId: string
  articleId: string
  issuedAt: number
}

function getSecret(): string {
  const secret =
    process.env.BETA_READ_SECRET ||
    process.env.LINE_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error("BETA_READ_SECRET is not configured")
  return secret
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url")
}

export function createBetaReadToken(
  userId: string,
  articleId: string,
  issuedAt = Date.now(),
): string {
  const payload: BetaReadTokenPayload = { userId, articleId, issuedAt }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${encoded}.${sign(encoded)}`
}

export function verifyQualifiedBetaReadToken(
  token: string,
  expectedUserId: string,
  expectedArticleId: string,
): boolean {
  const [encoded, suppliedSignature, extra] = token.split(".")
  if (!encoded || !suppliedSignature || extra) return false

  const expectedSignature = sign(encoded)
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<BetaReadTokenPayload>
    if (payload.userId !== expectedUserId || payload.articleId !== expectedArticleId) return false
    if (!Number.isFinite(payload.issuedAt)) return false
    const age = Date.now() - Number(payload.issuedAt)
    return age >= BETA_READ_QUALIFY_MS && age <= TOKEN_MAX_AGE_MS
  } catch {
    return false
  }
}
