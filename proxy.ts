import { type NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"
import {
  FREE_VIEW_COOKIE,
  FREE_VIEW_COOKIE_MAX_AGE,
  parseViewedIds,
  recordView,
  serializeViewedIds,
} from "@/lib/free-view"

export const config = {
  matcher: ["/admin/:path*", "/article/:path*"],
}

function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  let result = aBytes.length === bBytes.length ? 0 : 1
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ (bBytes[i] ?? 0)
  }
  return result === 0
}

function guardAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin/login")) return NextResponse.next()

  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next()
    return new NextResponse("ADMIN_API_KEY is not configured", { status: 500 })
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (cookie && constantTimeEqual(cookie, apiKey)) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = "/admin/login"
  url.search = ""
  return NextResponse.redirect(url)
}

function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    (request.headers.get("sec-purpose") ?? "").includes("prefetch")
  )
}

function hasSupabaseSession(request: NextRequest): boolean {
  // Supabase SSR stores the session in cookies named `sb-<ref>-auth-token`.
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"))
}

/**
 * Tracks anonymous article reads in a cookie so the article page can gate the
 * (FREE_ARTICLE_LIMIT + 1)-th distinct article behind login. We only mutate
 * the cookie here — the page reads it back (via the forwarded request) to
 * decide between the full view and the teaser.
 */
function trackArticleView(request: NextRequest) {
  const { pathname } = request.nextUrl
  const id = pathname.split("/")[2] // /article/<id>

  // Skip prefetches and signed-in visitors — neither should consume the quota.
  if (!id || isPrefetch(request) || hasSupabaseSession(request)) {
    return NextResponse.next()
  }

  const viewed = parseViewedIds(request.cookies.get(FREE_VIEW_COOKIE)?.value)
  const { viewed: nextViewed, changed } = recordView(viewed, id)
  if (!changed) return NextResponse.next()

  const value = serializeViewedIds(nextViewed)
  request.cookies.set(FREE_VIEW_COOKIE, value)
  const response = NextResponse.next({ request })
  response.cookies.set(FREE_VIEW_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: FREE_VIEW_COOKIE_MAX_AGE,
  })
  return response
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) return guardAdmin(request)
  if (pathname.startsWith("/article")) return trackArticleView(request)

  return NextResponse.next()
}
