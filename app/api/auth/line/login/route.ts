import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import {
  buildLineAuthorizeUrl,
  getRequestOrigin,
  LINE_ERROR_PATH_COOKIE,
  LINE_MODE_COOKIE,
  LINE_NEXT_COOKIE,
  LINE_STATE_COOKIE,
} from "@/lib/line-auth"

const COOKIE_MAX_AGE = 600 // 10 minutes to complete the LINE round-trip

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = getRequestOrigin(request, requestUrl.origin)
  const next = getSafeAuthRedirectPath(requestUrl.searchParams.get("next"))
  const errorPath =
    getSafeAuthRedirectPath(requestUrl.searchParams.get("error_path")) || "/login"
  const mode = requestUrl.searchParams.get("mode") === "unlock" ? "unlock" : "login"

  const state = randomUUID()

  let authorizeUrl: string
  try {
    authorizeUrl = buildLineAuthorizeUrl({ origin, state })
  } catch {
    const fallback = new URL(errorPath, origin)
    fallback.searchParams.set("auth_error", "oauth_callback")
    return NextResponse.redirect(fallback)
  }

  const response = NextResponse.redirect(authorizeUrl)
  const secure = process.env.NODE_ENV === "production"
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }
  response.cookies.set(LINE_STATE_COOKIE, state, cookieOptions)
  response.cookies.set(LINE_NEXT_COOKIE, next, cookieOptions)
  response.cookies.set(LINE_ERROR_PATH_COOKIE, errorPath, cookieOptions)
  response.cookies.set(LINE_MODE_COOKIE, mode, cookieOptions)
  return response
}
