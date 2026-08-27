"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { LineAuthButton } from "@/components/line-auth-button"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"

function SignupForm() {
  const searchParams = useSearchParams()
  const next = getSafeAuthRedirectPath(searchParams.get("next"))
  const callbackError = searchParams.get("auth_error")
  const [error, setError] = useState<string | null>(
    callbackError === "oauth_callback"
      ? "LINE認証に失敗しました。時間をおいて再度お試しください。"
      : null,
  )

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-1.5">
          <p className="text-xs font-bold tracking-[0.12em] text-[#059b43]">
            正式リリース記念
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            サイトアカウントを作成
          </h1>
          <p className="text-[13px] leading-6 text-muted-foreground">
            LINEアカウントなら、パスワード入力なしですぐに作成できます。
          </p>
        </div>

        <LineAuthButton
          label="LINEでアカウントを作成"
          nextPath={next}
          errorPath="/signup"
          onError={setError}
        />

        {error && (
          <p className="mt-4 text-[13px] leading-6 text-destructive">{error}</p>
        )}
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          無料購読を有効にするには、公式LINEで配布されたコードを入力してください。
        </p>
        <p className="mt-6 text-center text-[13px] leading-6 text-muted-foreground">
          既にアカウントをお持ちの方は{" "}
          <Link
            href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-accent hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
