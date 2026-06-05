import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import {
  exchangeLineCode,
  fetchLineProfile,
  getRequestOrigin,
  lineDerivedPassword,
  lineSyntheticEmail,
  LINE_ERROR_PATH_COOKIE,
  LINE_NEXT_COOKIE,
  LINE_STATE_COOKIE,
} from "@/lib/line-auth"
import { getServiceClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server-auth"

function clearOAuthCookies(store: Awaited<ReturnType<typeof cookies>>) {
  for (const name of [
    LINE_STATE_COOKIE,
    LINE_NEXT_COOKIE,
    LINE_ERROR_PATH_COOKIE,
  ]) {
    store.set(name, "", { maxAge: 0, path: "/" })
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = getRequestOrigin(request, requestUrl.origin)
  const store = await cookies()

  const errorPath =
    getSafeAuthRedirectPath(store.get(LINE_ERROR_PATH_COOKIE)?.value) || "/login"
  const next = getSafeAuthRedirectPath(store.get(LINE_NEXT_COOKIE)?.value)

  const errorRedirect = () => {
    clearOAuthCookies(store)
    const url = new URL(errorPath, origin)
    url.searchParams.set("auth_error", "oauth_callback")
    return NextResponse.redirect(url)
  }

  const code = requestUrl.searchParams.get("code")
  const state = requestUrl.searchParams.get("state")
  const expectedState = store.get(LINE_STATE_COOKIE)?.value

  // CSRF: state must match the value we set before redirecting to LINE.
  if (!code || !state || !expectedState || state !== expectedState) {
    return errorRedirect()
  }

  try {
    const accessToken = await exchangeLineCode({ code, origin })
    const profile = await fetchLineProfile(accessToken)

    const email = lineSyntheticEmail(profile.userId)
    const password = lineDerivedPassword(profile.userId)
    const sessionClient = await getSupabaseServerClient()

    // Sign in if the account already exists; otherwise create it, then sign in.
    let { error: signInError } = await sessionClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const { error: createError } = await getServiceClient().auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          provider: "line",
          line_user_id: profile.userId,
          name: profile.displayName,
          full_name: profile.displayName,
          avatar_url: profile.pictureUrl,
          picture: profile.pictureUrl,
        },
      })

      // Ignore "already registered" — a concurrent first login may have won the
      // race; we just retry the sign-in below.
      if (createError && !/already|registered|exists/i.test(createError.message)) {
        throw createError
      }

      ;({ error: signInError } = await sessionClient.auth.signInWithPassword({
        email,
        password,
      }))
      if (signInError) throw signInError
    }

    clearOAuthCookies(store)
    return NextResponse.redirect(new URL(next, origin))
  } catch (error) {
    console.error("[line-auth] callback failed:", error)
    return errorRedirect()
  }
}
