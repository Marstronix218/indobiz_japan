"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronRight, LineChart } from "lucide-react"
import type { MarketSnapshotLive } from "@/lib/market-data"

type Row = { label: string; value: string; change: string; up: boolean }

const WANTED = ["Sensex", "Nifty 50", "USD/INR", "INR/JPY", "Gold", "Brent"]

function rowsFromLive(snapshot: MarketSnapshotLive): Row[] {
  const map = new Map(snapshot.items.map((q) => [q.label, q]))
  return WANTED.map((w) => map.get(w))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      label: q.label,
      value: q.value,
      change: q.change,
      up: q.direction === "up",
    }))
}

function formatAsOf(ts: number): string {
  return new Date(ts * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  })
}

export function MarketIndicatorPanel() {
  const [snapshot, setSnapshot] = useState<MarketSnapshotLive | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/market/snapshot", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as MarketSnapshotLive
        if (!cancelled) setSnapshot(data)
      } catch {
        // keep last snapshot / placeholder
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const rows: Row[] = snapshot
    ? rowsFromLive(snapshot)
    : WANTED.map((label) => ({ label, value: "—", change: "—", up: false }))
  const asOf = snapshot ? `${formatAsOf(snapshot.asOf)} IST 時点` : "ロード中…"

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-2.5 flex items-center gap-2 border-b border-border pb-2">
        <LineChart className="size-3.5 text-primary" />
        <h3 className="font-serif text-[13px] font-bold">マーケット指標</h3>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <td className="py-1 text-muted-foreground">{row.label}</td>
              <td className="py-1 text-right font-mono font-semibold tabular-nums">
                {row.value}
              </td>
              <td
                className={
                  "py-1 pl-2 text-right font-mono text-[11px] " +
                  (row.up ? "text-primary" : "text-accent")
                }
              >
                {row.change !== "—" ? (row.up ? "▲" : "▼") : ""} {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-right font-mono text-[10px] text-muted-foreground">
        {asOf}
      </p>
      <p className="mt-1 text-right text-[10px] text-muted-foreground">
        出典：Yahoo Finance
      </p>
      <Link
        href="/?category=market"
        className="mt-2 flex items-center justify-end gap-0.5 text-[11px] font-semibold text-primary hover:underline"
      >
        市況一覧を見る
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}
