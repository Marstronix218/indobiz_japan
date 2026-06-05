"use client"

import Link from "next/link"
import { useState } from "react"
import { MessageSquarePlus, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Result = {
  status: "accepted" | "rejected" | "error"
  applied?: boolean
  message: string
}

export function ArticleFeedback({
  articleId,
  canSubmit,
}: {
  articleId: string
  canSubmit: boolean
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const trimmed = message.trim()
    if (trimmed.length < 4) {
      setError("もう少し具体的に記入してください。")
      return
    }
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, message: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? "送信に失敗しました。")
        return
      }
      setResult({
        status: data.status,
        applied: data.applied,
        message: data.message,
      })
      setMessage("")
    } catch {
      setError("通信エラーが発生しました。")
    } finally {
      setSubmitting(false)
    }
  }

  if (!canSubmit) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground sm:p-6">
        <p>
          記事の改善フィードバックを送るには{" "}
          <Link href="/login" className="text-accent hover:underline">
            ログイン
          </Link>{" "}
          が必要です。
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            記事を改善する
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            気になった点を送ると、編集AIが内容を審査し、妥当なものは今後の記事生成に自動で反映します。
          </p>
        </div>
        {!open && !result && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setOpen(true)}
          >
            <MessageSquarePlus className="size-4" />
            フィードバック
          </Button>
        )}
      </div>

      {result ? (
        <div
          className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            result.status === "accepted"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : result.status === "rejected"
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-border bg-secondary/30 text-foreground"
          }`}
        >
          {result.status === "accepted" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="space-y-2">
            <p>{result.message}</p>
            <button
              type="button"
              className="text-xs text-muted-foreground underline hover:text-foreground"
              onClick={() => {
                setResult(null)
                setOpen(true)
              }}
            >
              別のフィードバックを送る
            </button>
          </div>
        </div>
      ) : open ? (
        <div className="mt-4 space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例: 固有名詞が曖昧で『大手企業』とぼかされがち。可能な限り企業名を明記してほしい。"
            rows={4}
            maxLength={2000}
            disabled={submitting}
            className="resize-y"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setOpen(false)
                setError(null)
                setMessage("")
              }}
            >
              キャンセル
            </Button>
            <Button size="sm" disabled={submitting} onClick={handleSubmit}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              送信
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
