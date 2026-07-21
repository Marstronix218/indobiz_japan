"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { BETA_READ_QUALIFY_MS } from "@/lib/beta-config"

interface BetaReadProgressProps {
  articleId: string
  initialReadsCount: number
  requiredReads: number
  readToken: string
}

export function BetaReadProgress({
  articleId,
  initialReadsCount,
  requiredReads,
  readToken,
}: BetaReadProgressProps) {
  const [readsCount, setReadsCount] = useState(initialReadsCount)
  const eligible = readsCount >= requiredReads

  useEffect(() => {
    if (eligible) return

    let remaining = BETA_READ_QUALIFY_MS
    let startedAt = document.visibilityState === "visible" ? Date.now() : null
    let timeout: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    async function qualifyRead() {
      try {
        const response = await fetch("/api/beta/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId, readToken }),
        })
        if (!response.ok) return
        const result = (await response.json()) as { readsCount?: number }
        if (!cancelled && typeof result.readsCount === "number") {
          setReadsCount(result.readsCount)
        }
      } catch {
        // Reading must never be interrupted by a non-critical analytics failure.
      }
    }

    function schedule() {
      if (remaining <= 0) {
        void qualifyRead()
        return
      }
      startedAt = Date.now()
      timeout = setTimeout(() => void qualifyRead(), remaining)
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        if (startedAt !== null) remaining -= Date.now() - startedAt
        startedAt = null
        if (timeout) clearTimeout(timeout)
        timeout = null
        return
      }
      schedule()
    }

    if (document.visibilityState === "visible") schedule()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      cancelled = true
      if (timeout) clearTimeout(timeout)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [articleId, eligible, readToken])

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          {eligible && <CheckCircle2 className="size-4 text-primary" aria-hidden />}
          <span className="font-semibold text-foreground">IndoBiz β 体験版</span>
          <span className="text-muted-foreground">
            {Math.min(readsCount, requiredReads)} / {requiredReads} 記事を閲覧
          </span>
        </div>
        {eligible ? (
          <Link
            href={`/beta/survey?next=${encodeURIComponent(`/article/${articleId}`)}`}
            className="font-semibold text-primary hover:underline"
          >
            アンケートに回答して全記事を開放
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">
            あと{requiredReads - readsCount}記事でアンケートに進めます
          </span>
        )}
      </div>
    </div>
  )
}
