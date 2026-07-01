"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GooeyGradientBackground } from "@/components/gooey-gradient-background"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"

type AuthState = "loading" | "in" | "out"

/**
 * トップページ最上部に表示する「存在意義」イントロ帯。
 * 初見ユーザーに「何のサイトか・誰向けか」を一目で伝える。
 * 未ログイン時のみ登録/相談CTAを出す(ログイン済みには冗長なため非表示)。
 */
export function SiteIntro({
  withBackground = true,
}: {
  withBackground?: boolean
}) {
  const [authState, setAuthState] = useState<AuthState>("loading")

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setAuthState(data.user ? "in" : "out")
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState(session?.user ? "in" : "out")
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const content = (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl border-l-2 border-orange-400 pl-4">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-orange-300">
              FOR JAPANESE BUSINESS · INDIA MARKET INTELLIGENCE
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold leading-snug text-white">
              インド市場の変化を、日本企業の意思決定に使える情報へ。
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/80 sm:text-[15px]">
              現地の一次情報を編集部とAIが日本語で整理。インド進出・調達・投資・採用・規制対応の判断に必要なニュースと実務情報を、日本企業向けにお届けします。
            </p>
          </div>

          {authState === "out" && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                asChild
                size="sm"
                className="bg-white text-emerald-950 hover:bg-orange-200"
              >
                <Link href="/signup">無料で全文を読む</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-emerald-950"
              >
                <Link href="/contact?leadType=expansion">法人導入を相談する</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )

  if (!withBackground) return content

  return (
    <GooeyGradientBackground
      interactive={false}
      className="border-b border-white/20 text-white"
      contentClassName="bg-black/25"
    >
      {content}
    </GooeyGradientBackground>
  )
}
