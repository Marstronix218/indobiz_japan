"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export function LineCtaBox() {
  // null = auth state not yet known. We only show the "log in" hint once we've
  // confirmed the visitor is logged OUT, so a logged-in user never sees it
  // (not even a flash during the initial auth check).
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) setLoggedIn(Boolean(data.user))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setLoggedIn(Boolean(session?.user)),
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-5 text-center">
      <p className="font-serif text-sm font-bold text-primary">
        Go India 公式LINE 会員特典
      </p>
      <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
        友だち追加とLINE連携で、IndoBiz Japan の全記事を無料で読めます。
      </p>
      <a
        href={LINE_ADD_FRIEND_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#06c755] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#05b64e]"
      >
        <MessageCircle aria-hidden className="size-4" />
        LINEで友だち追加する
      </a>
      {loggedIn === false && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          すでに友だちの方は
          <Link href="/login" className="font-semibold text-primary hover:underline">
            ログイン
          </Link>
          してください
        </p>
      )}
    </div>
  )
}
