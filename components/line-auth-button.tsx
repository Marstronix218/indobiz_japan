"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"

interface LineAuthButtonProps {
  label: string
  nextPath: string
  errorPath?: string
  disabled?: boolean
  onError?: (message: string | null) => void
}

// Kicks off our self-hosted LINE OAuth flow (app/api/auth/line/*). We handle the
// code exchange + Supabase session server-side because LINE's HS256 ID tokens
// are incompatible with Supabase's native custom-OIDC provider.
function getLoginUrl(nextPath: string, errorPath?: string): string {
  const url = new URL("/api/auth/line/login", window.location.origin)
  const safeNextPath = getSafeAuthRedirectPath(nextPath)
  if (safeNextPath !== "/") {
    url.searchParams.set("next", safeNextPath)
  }
  const safeErrorPath = getSafeAuthRedirectPath(errorPath ?? null)
  if (safeErrorPath !== "/") {
    url.searchParams.set("error_path", safeErrorPath)
  }
  return url.toString()
}

export function LineAuthButton({
  label,
  nextPath,
  errorPath,
  disabled,
  onError,
}: LineAuthButtonProps) {
  const [submitting, setSubmitting] = useState(false)

  function handleLineAuth() {
    if (submitting) return
    setSubmitting(true)
    onError?.(null)
    window.location.href = getLoginUrl(nextPath, errorPath)
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
