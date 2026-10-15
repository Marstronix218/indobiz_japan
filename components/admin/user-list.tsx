"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatDateTime } from "@/lib/date-format"

interface AdminUser {
  id: string
  displayName: string | null
  email: string | null
  provider: "line" | "email"
  avatarUrl: string | null
  createdAt: string
  lastSignInAt: string | null
  emailConfirmed: boolean
}

interface UsersResponse {
  ok: boolean
  total?: number
  users?: AdminUser[]
  error?: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const PAGE_SIZE = 50

export function UserList() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/users", { credentials: "same-origin" })
      .then(async (res) => {
        const json = (await res.json()) as UsersResponse
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }
        return json.users ?? []
      })
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "不明なエラー")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totals = useMemo(() => {
    const list = users ?? []
    const now = Date.now()
    const within = (iso: string | null, days: number) =>
      iso !== null && now - new Date(iso).getTime() <= days * DAY_MS
    return {
      all: list.length,
      line: list.filter((u) => u.provider === "line").length,
      email: list.filter((u) => u.provider === "email").length,
      new7d: list.filter((u) => within(u.createdAt, 7)).length,
      active30d: list.filter((u) => within(u.lastSignInAt, 30)).length,
    }
  }, [users])

  const filtered = useMemo(() => {
    const list = users ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((u) =>
      [u.displayName, u.email, u.id].some((v) => v?.toLowerCase().includes(q)),
    )
  }, [users, search])

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 text-left"
        >
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
          />
          <div>
            <h2 className="text-sm font-semibold text-foreground">登録ユーザー</h2>
            <p className="text-xs text-muted-foreground">
              {open ? "Supabase Auth の全アカウント。日時は日本時間" : "クリックで一覧を表示"}
            </p>
          </div>
        </button>
        {users && !error && (
          <div className="flex flex-wrap gap-4 text-right">
            <Stat label="総数" value={totals.all} />
            <Stat label="LINE" value={totals.line} />
            <Stat label="メール" value={totals.email} />
            <Stat label="7日以内の新規" value={totals.new7d} />
            <Stat label="30日以内にログイン" value={totals.active30d} />
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive">
          ユーザー情報の取得に失敗しました: {error}
        </p>
      ) : !open ? null : loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">読み込み中…</p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="relative sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="名前・メール・IDで検索"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              該当するユーザーがいません。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メール</TableHead>
                  <TableHead>登録方法</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead>最終ログイン</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, visible).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt=""
                            className="size-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="size-6 rounded-full bg-muted" />
                        )}
                        <span className="font-medium">
                          {user.displayName ?? "（未設定）"}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        {user.id}
                      </p>
                    </TableCell>
                    <TableCell>
                      {user.email ? (
                        <span>
                          {user.email}
                          {!user.emailConfirmed && (
                            <span className="ml-1 text-xs text-amber-600">未確認</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.provider === "line" ? "default" : "secondary"}>
                        {user.provider === "line" ? "LINE" : "メール"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {user.lastSignInAt ? formatDateTime(user.lastSignInAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filtered.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              さらに表示（残り {filtered.length - visible} 件）
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
