import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import {
  exchangeLineCode,
  fetchLineFriendshipStatus,
  fetchLineProfile,
  getRequestOrigin,
  lineDerivedPassword,
  lineFriendProofRef,
  lineSyntheticEmail,
  LINE_ERROR_PATH_COOKIE,
  LINE_MODE_COOKIE,
  LINE_NEXT_COOKIE,
  LINE_STATE_COOKIE,
} from "@/lib/line-auth"
import { getServiceClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server-auth"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

class LineFriendCheckError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause })
    this.name = "LineFriendCheckError"
  }
}

function clearOAuthCookies(store: Awaited<ReturnType<typeof cookies>>) {
  for (const name of [
    LINE_STATE_COOKIE,
    LINE_NEXT_COOKIE,
    LINE_ERROR_PATH_COOKIE,
    LINE_MODE_COOKIE,
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
  const mode = store.get(LINE_MODE_COOKIE)?.value === "unlock" ? "unlock" : "login"

  const errorRedirect = (authError = "oauth_callback") => {
    clearOAuthCookies(store)
    const url = new URL(errorPath, origin)
    url.searchParams.set("auth_error", authError)
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
    const sessionClient = await getSupabaseServerClient()
    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await sessionClient.auth.getUser()

    // Unlock is an account-linking operation. Require a server-verified current
    // user and never fall back to signing in as the synthetic LINE account.
    if (mode === "unlock" && (sessionError || !sessionUser)) {
      throw new Error("LINE unlock requires an authenticated session")
    }

    const accessToken = await exchangeLineCode({ code, origin })
    const [profile, friendship] = await Promise.all([
      fetchLineProfile(accessToken),
      fetchLineFriendshipStatus(accessToken).catch((error) => {
        if (mode !== "unlock") {
          console.warn("[line-auth] friendship check unavailable during login:", error)
          return { friendFlag: false }
        }
        throw new LineFriendCheckError(
          "Could not verify the LINE friendship status",
          error,
        )
      }),
    ])

    if (mode === "unlock" && !friendship.friendFlag) {
      clearOAuthCookies(store)
      const url = new URL(next, origin)
      url.searchParams.set("line_friend_required", "1")
      return NextResponse.redirect(url)
    }

    let targetUserId: string

    if (mode === "unlock") {
      // The guard above establishes that sessionUser is present in unlock mode.
      targetUserId = sessionUser!.id
    } else {
      const email = lineSyntheticEmail(profile.userId)
      const password = lineDerivedPassword(profile.userId)

      // Sign in if the account already exists; otherwise create it, then sign in.
      let { data: signInData, error: signInError } =
        await sessionClient.auth.signInWithPassword({ email, password })

      if (signInError) {
        const { error: createError } =
          await getServiceClient().auth.admin.createUser({
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

        // Ignore "already registered" — a concurrent first login may have won
        // the race; we just retry the sign-in below.
        if (createError && !/already|registered|exists/i.test(createError.message)) {
          throw createError
        }

        ;({ data: signInData, error: signInError } =
          await sessionClient.auth.signInWithPassword({ email, password }))
        if (signInError) throw signInError
      }

      if (!signInData.user) {
        throw new Error("LINE sign-in response missing user")
      }
      targetUserId = signInData.user.id
    }

    // A current callback-time friendship API response is the access proof.
    // friendFlag=false is intentionally a successful login without a grant.
    if (friendship.friendFlag && isBetaAccessEnabled()) {
      const { error: grantError } = await getServiceClient().rpc(
        "grant_beta_access",
        {
          p_user_id: targetUserId,
          p_source: "line_friend",
          p_proof_ref: lineFriendProofRef(profile.userId),
        },
      )
      if (grantError) {
        throw new LineFriendCheckError(
          "Could not grant access from the LINE friendship proof",
          grantError,
        )
      }
    }

    clearOAuthCookies(store)
    return NextResponse.redirect(new URL(next, origin))
  } catch (error) {
    console.error("[line-auth] callback failed:", error)
    return errorRedirect(
      error instanceof LineFriendCheckError
        ? "line_friend_check"
        : "oauth_callback",
    )
  }
}
