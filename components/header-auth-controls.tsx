"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"

type DisplayUser = { label: string } | null

// LINE accounts have no real email (we store a synthetic line_*@line.invalid
// address), so prefer the display name from user_metadata and fall back to the
// email only for password accounts.
function toDisplayUser(user: {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
} | null | undefined): DisplayUser {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  const name =
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    null
  const email = user.email && !user.email.endsWith("@line.invalid") ? user.email : null
  return { label: name || email || "アカウント" }
}

export function HeaderAuthControls({
  surface = "default",
}: {
  surface?: "default" | "topbar"
}) {
  const router = useRouter()
  const [user, setUser] = useState<DisplayUser>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setUser(toDisplayUser(data.user))
      setLoaded(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(toDisplayUser(session?.user))
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!loaded) {
    return surface === "topbar" ? null : <div className="h-8 w-32" aria-hidden />
  }

  if (surface === "topbar") {
    if (user) {
      return (
        <div className="flex items-center gap-3 text-[11px] text-primary-foreground/90">
          <span
            className="hidden max-w-[10rem] truncate sm:inline"
            title={user.label}
          >
            {user.label}
          </span>
          <Link href="/profile" className="hover:text-primary-foreground">
            マイページ
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="hover:text-primary-foreground"
          >
            ログアウト
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 text-[11px] text-primary-foreground/90">
        <Link href="/login" className="hover:text-primary-foreground">
          ログイン
        </Link>
        <Link href="/signup" className="hover:text-primary-foreground">
          新規登録
        </Link>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="hidden max-w-[12rem] truncate text-xs text-muted-foreground sm:inline"
          title={user.label}
        >
          {user.label}
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile">マイページ</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">ログイン</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/signup">新規登録</Link>
      </Button>
    </div>
  )
}
