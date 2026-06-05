import { NextResponse } from "next/server"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import { getSupabaseServerClient } from "@/lib/supabase/server-auth"

function getRequestOrigin(request: Request, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  if (!forwardedHost || process.env.NODE_ENV === "development") {
    return fallbackOrigin
  }

  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0] ?? "https"
  return `${forwardedProto}://${forwardedHost}`
}

function getErrorUrl(origin: string, errorPath: string, nextPath: string): URL {
  const url = new URL(errorPath, origin)
  url.searchParams.set("auth_error", "oauth_callback")
  if (nextPath !== "/") {
    url.searchParams.set("next", nextPath)
  }
  return url
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = getRequestOrigin(request, requestUrl.origin)
  const code = requestUrl.searchParams.get("code")
  const nextPath = getSafeAuthRedirectPath(requestUrl.searchParams.get("next"))
  const errorPath = getSafeAuthRedirectPath(requestUrl.searchParams.get("error_path")) || "/login"

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, origin))
    }
  }

  return NextResponse.redirect(getErrorUrl(origin, errorPath, nextPath))
}
