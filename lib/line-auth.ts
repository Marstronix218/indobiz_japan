import { createHash, createHmac } from "node:crypto"

// LINE Login OAuth 2.1 endpoints
export const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize"
export const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token"
export const LINE_PROFILE_URL = "https://api.line.me/v2/profile"
export const LINE_FRIENDSHIP_STATUS_URL =
  "https://api.line.me/friendship/v1/status"

// We deliberately request only `profile` — NOT `openid`. Requesting `openid`
// makes LINE return an HS256-signed ID token, which Supabase's OIDC verifier
// rejects (it expects ES256). With `profile` only we get a plain access token
// and read the user via /v2/profile, sidestepping ID-token verification.
export const LINE_SCOPES = "profile"

export const LINE_STATE_COOKIE = "line_oauth_state"
export const LINE_NEXT_COOKIE = "line_oauth_next"
export const LINE_ERROR_PATH_COOKIE = "line_oauth_error_path"
export const LINE_MODE_COOKIE = "line_oauth_mode"

export type LineAuthMode = "login" | "unlock"

export interface LineProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface LineFriendshipStatus {
  friendFlag: boolean
}

export function getLineCallbackUrl(origin: string): string {
  return new URL("/api/auth/line/callback", origin).toString()
}

/**
 * Reconstruct the public origin behind Vercel's proxy, so the redirect_uri
 * matches exactly between the login redirect and the token exchange (LINE
 * rejects a mismatch).
 */
export function getRequestOrigin(request: Request, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  if (!forwardedHost || process.env.NODE_ENV === "development") {
    return fallbackOrigin
  }
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0] ?? "https"
  return `${forwardedProto}://${forwardedHost}`
}

export function buildLineAuthorizeUrl(params: {
  origin: string
  state: string
}): string {
  const clientId = process.env.LINE_CHANNEL_ID
  if (!clientId) throw new Error("環境変数 LINE_CHANNEL_ID が設定されていません")

  const url = new URL(LINE_AUTHORIZE_URL)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", getLineCallbackUrl(params.origin))
  url.searchParams.set("state", params.state)
  url.searchParams.set("scope", LINE_SCOPES)
  // If the Login channel is linked to an Official Account, ask users who have
  // not added it yet to do so as part of the authorization flow.
  url.searchParams.set("bot_prompt", "aggressive")
  return url.toString()
}

export async function exchangeLineCode(params: {
  code: string
  origin: string
}): Promise<string> {
  const clientId = process.env.LINE_CHANNEL_ID
  const clientSecret = process.env.LINE_CHANNEL_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("LINE_CHANNEL_ID / LINE_CHANNEL_SECRET が設定されていません")
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: getLineCallbackUrl(params.origin),
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`LINE token exchange failed (${res.status}): ${detail}`)
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("LINE token response missing access_token")
  return data.access_token
}

export async function fetchLineProfile(accessToken: string): Promise<LineProfile> {
  const res = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`LINE profile fetch failed (${res.status}): ${detail}`)
  }
  const data = (await res.json()) as Partial<LineProfile>
  if (!data.userId) throw new Error("LINE profile response missing userId")
  return {
    userId: data.userId,
    displayName: data.displayName ?? "LINEユーザー",
    pictureUrl: data.pictureUrl,
    statusMessage: data.statusMessage,
  }
}

/**
 * Check the current friendship status directly with LINE. This callback-time
 * check, rather than a friendship_status_changed webhook alone, is the proof
 * used to grant access.
 */
export async function fetchLineFriendshipStatus(
  accessToken: string,
): Promise<LineFriendshipStatus> {
  const res = await fetch(LINE_FRIENDSHIP_STATUS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(
      `LINE friendship status fetch failed (${res.status}): ${detail}`,
    )
  }

  const data = (await res.json()) as { friendFlag?: unknown }
  if (typeof data.friendFlag !== "boolean") {
    throw new Error("LINE friendship status response missing friendFlag")
  }
  return { friendFlag: data.friendFlag }
}

/**
 * Store only a one-way reference to the channel-scoped LINE user ID in the
 * entitlement proof. This is stable for idempotency without retaining the raw
 * external identifier in the access table.
 */
export function lineFriendProofRef(userId: string): string {
  return `line:${createHash("sha256").update(userId).digest("hex")}`
}

/**
 * Stable, non-deliverable email for a LINE user. `.invalid` is an RFC 2606
 * reserved TLD, so these addresses can never receive mail.
 */
export function lineSyntheticEmail(userId: string): string {
  return `line_${userId.toLowerCase()}@line.invalid`
}

/**
 * Deterministic per-user password so the same LINE account always maps to the
 * same Supabase user without storing credentials. Prefers LINE_SESSION_SECRET;
 * falls back to the service-role key (stable + secret) if it is unset.
 */
export function lineDerivedPassword(userId: string): string {
  const secret =
    process.env.LINE_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error("LINE_SESSION_SECRET（または SUPABASE_SERVICE_ROLE_KEY）が必要です")
  }
  return createHmac("sha256", secret).update(`line:${userId}`).digest("base64url")
}
