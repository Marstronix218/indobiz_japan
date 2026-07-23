"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock3, KeyRound, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BetaAccessPhase } from "@/lib/beta-access"

export function BetaExtensionForm({ phase }: { phase: BetaAccessPhase }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/beta/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const body = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !body.ok) {
        throw new Error(body.error || "延長コードを認証できませんでした。")
      }

      setCompleted(true)
      setCode("")
      router.refresh()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "延長コードを認証できませんでした。",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (completed || phase === "extension_access") {
    return (
      <StatusCard
        icon={<CheckCircle2 aria-hidden className="size-12 text-emerald-600" />}
        title="延長が有効になりました"
        description="アンケートへのご協力ありがとうございます。さらに14日間、全記事を無料でご利用いただけます。"
      />
    )
  }

  if (phase === "initial_access") {
    return (
      <StatusCard
        icon={<Clock3 aria-hidden className="size-12 text-primary" />}
        title="最初の無料期間をご利用中です"
        description="延長コードは、最初の14日間が終了した後に入力できます。"
      />
    )
  }

  if (phase === "expired") {
    return (
      <StatusCard
        icon={<LockKeyhole aria-hidden className="size-12 text-primary" />}
        title="ベータ版の無料期間が終了しました"
        description="このアカウントでは延長コードを使用済みです。再延長はできません。"
      />
    )
  }

  return (
    <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm sm:p-9">
      <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        <KeyRound aria-hidden className="size-5" />
      </span>
      <h1 className="mt-5 font-serif text-2xl font-bold text-foreground">
        延長コードを入力してください
      </h1>
      <p className="mt-3 text-base leading-8 text-muted-foreground">
        アンケート回答後に表示された延長コードを入力すると、このアカウントの無料期間が14日間延長されます。
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="extension-code" className="text-sm font-semibold">
            延長コード
          </label>
          <Input
            id="extension-code"
            name="extension-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              if (error) setError("")
            }}
            placeholder="延長コード"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "extension-code-error" : undefined}
            className="h-11 font-mono uppercase tracking-wider"
          />
          {error && (
            <p
              id="extension-code-error"
              className="text-sm leading-6 text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={submitting || !code.trim()}
        >
          {submitting ? "認証中…" : "認証する"}
        </Button>
      </form>
    </section>
  )
}

function StatusCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-sm sm:p-9">
      <span className="flex justify-center">{icon}</span>
      <h1 className="mt-5 font-serif text-2xl font-bold text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-base leading-8 text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href="/">トップページへ戻る</Link>
      </Button>
    </section>
  )
}
