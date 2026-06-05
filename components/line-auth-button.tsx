"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"

const LINE_AUTH_PROVIDER = "custom:line" as const
const LINE_AUTH_SCOPES = "openid profile"

interface LineAuthButtonProps {
  label: string
  nextPath: string
  errorPath?: string
  disabled?: boolean
  onError?: (message: string | null) => void
}

function getCallbackUrl(nextPath: string, errorPath?: string): string {
  const callbackUrl = new URL("/auth/callback", window.location.origin)
  const safeNextPath = getSafeAuthRedirectPath(nextPath)
  if (safeNextPath !== "/") {
    callbackUrl.searchParams.set("next", safeNextPath)
  }
  const safeErrorPath = getSafeAuthRedirectPath(errorPath ?? null)
  if (safeErrorPath !== "/") {
    callbackUrl.searchParams.set("error_path", safeErrorPath)
  }
  return callbackUrl.toString()
}

export function LineAuthButton({
  label,
  nextPath,
  errorPath,
  disabled,
  onError,
}: LineAuthButtonProps) {
  const [submitting, setSubmitting] = useState(false)

  async function handleLineAuth() {
    if (submitting) return
    setSubmitting(true)
    onError?.(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: LINE_AUTH_PROVIDER,
        options: {
          redirectTo: getCallbackUrl(nextPath, errorPath),
          scopes: LINE_AUTH_SCOPES,
        },
      })
      if (error) throw error
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "LINE認証に失敗しました"
      onError?.(message)
      setSubmitting(false)
    }
  }

  return (
    <Button
      type="button"
      className="w-full border-[#06c755] bg-[#06c755] text-white hover:bg-[#05b64e] hover:text-white"
      disabled={disabled || submitting}
      onClick={handleLineAuth}
    >
      <MessageCircle aria-hidden className="size-4" />
      {submitting ? "LINEへ移動中..." : label}
    </Button>
  )
}
