"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Eye,
  ImageOff,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { ArticleFormDialog } from "@/components/admin/article-form-dialog"
import { GenerationStats } from "@/components/admin/generation-stats"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useArticles } from "@/lib/article-store"
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  formatJstDate,
  formatJstDateTime,
  getAllSources,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  WORKFLOW_STATUS_LABELS,
  type Category,
  type NewsArticle,
  type QualityVerdict,
  type WorkflowStatus,
} from "@/lib/news-data"

const QUALITY_VERDICT_LABELS: Record<QualityVerdict, string> = {
  PASS: "品質OK",
  REVISION: "要修正",
  REJECT: "AI差戻",
}

const QUALITY_VERDICT_BADGE_CLASS: Record<QualityVerdict, string> = {
  PASS: "border-emerald-500/50 text-emerald-700",
  REVISION: "border-amber-500/60 text-amber-700",
  REJECT: "border-red-500/60 text-red-700",
}

type StatusTab = "all" | WorkflowStatus

const STATUS_TAB_LABELS: Record<StatusTab, string> = {
  all: "すべて",
  published: "公開中",
  review: "要確認",
  failed: "処理失敗",
}

const STATUS_TAB_ORDER: StatusTab[] = ["all", "published", "review", "failed"]

type QualityFilter = "all" | QualityVerdict | "none"

const QUALITY_FILTER_LABELS: Record<QualityFilter, string> = {
  all: "すべての品質",
  PASS: "品質OK",
  REVISION: "要修正",
  REJECT: "AI差戻",
  none: "未チェック",
}

type SortOrder = "newest" | "oldest"
type SortBasis = "created" | "source"

const SORT_LABELS: Record<SortOrder, string> = {
  newest: "新しい順",
  oldest: "古い順",
}

const SORT_BASIS_LABELS: Record<SortBasis, string> = {
  created: "生成日時順",
  source: "原文日順",
}

export default function AdminPage() {
  const router = useRouter()
  const articles = useArticles()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [sortBasis, setSortBasis] = useState<SortBasis>("created")
  const [statusTab, setStatusTab] = useState<StatusTab>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [isPublishing, setIsPublishing] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  const counts = useMemo(() => {
    const byStatus = { published: 0, review: 0, failed: 0 } as Record<
      WorkflowStatus,
      number
    >
    let unsynthesized = 0
    for (const a of articles) {
      byStatus[a.workflowStatus] = (byStatus[a.workflowStatus] ?? 0) + 1
      if (a.isSynthesized === false) unsynthesized += 1
    }
    return {
      all: articles.length,
      published: byStatus.published,
      review: byStatus.review,
      failed: byStatus.failed,
      unsynthesized,
    }
  }, [articles])

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...articles]
      .filter((article) => {
        const haystack = [article.title, article.summary, ...article.implications]
          .join(" ")
          .toLowerCase()

        const matchesQuery = !query || haystack.includes(query)
        const matchesCategory =
          categoryFilter === "all" || article.category === categoryFilter
        const matchesStatus =
          statusTab === "all" || article.workflowStatus === statusTab
        const matchesQuality =
          qualityFilter === "all"
            ? true
            : qualityFilter === "none"
              ? !article.qualityCheck
              : article.qualityCheck?.verdict === qualityFilter

        return matchesQuery && matchesCategory && matchesStatus && matchesQuality
      })
      .sort((a, b) => {
        const dateFor = (article: NewsArticle) =>
          sortBasis === "created"
            ? article.createdAt ?? article.publishedAt
            : article.publishedAt
        const diff = new Date(dateFor(b)).getTime() - new Date(dateFor(a)).getTime()
        return sortOrder === "newest" ? diff : -diff
      })
  }, [articles, categoryFilter, qualityFilter, search, sortBasis, sortOrder, statusTab])

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    qualityFilter !== "all" ||
    statusTab !== "all"

  function resetFilters() {
    setSearch("")
    setCategoryFilter("all")
    setQualityFilter("all")
    setStatusTab("all")
  }

  function openCreateDialog() {
    setEditingId(null)
    setFormOpen(true)
  }

  function openEditDialog(id: string) {
    setEditingId(id)
    setFormOpen(true)
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`「${title}」を削除しますか？`)) return
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      toast.success("記事を削除しました。")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`削除失敗: ${message}`)
    }
  }

  async function handlePublish(article: NewsArticle) {
    setIsPublishing(article.id)
    try {
      const requestPublish = async (qualityOverride?: {
        verdict: QualityVerdict
        checkedAt: string
      }) => {
        const response = await fetch(`/api/admin/articles/${article.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            workflowStatus: "published",
            visibility: "public",
            qualityOverrideConfirmed: Boolean(qualityOverride),
            qualityOverrideVerdict: qualityOverride?.verdict,
            qualityOverrideCheckedAt: qualityOverride?.checkedAt,
          }),
        })
        const data = (await response.json()) as {
          ok?: boolean
          error?: string
          code?: string
          qualityVerdict?: QualityVerdict
          qualityNotes?: string
          qualityCheckedAt?: string
        }
        return { response, data }
      }

      let { response, data } = await requestPublish()
      if (
        response.status === 409 &&
        data.code === "QUALITY_OVERRIDE_REQUIRED"
      ) {
        const notes = data.qualityNotes?.trim()
        const confirmed = window.confirm(
          [
            "AI品質チェックの指摘があります。本当に公開しますか？",
            data.qualityVerdict ? `判定: ${QUALITY_VERDICT_LABELS[data.qualityVerdict]}` : "",
            notes ? `\n${notes}` : "",
          ].filter(Boolean).join("\n"),
        )
        if (!confirmed) return
        if (!data.qualityVerdict || !data.qualityCheckedAt) {
          throw new Error("品質判定の版情報を取得できませんでした。再読み込みしてください")
        }
        ;({ response, data } = await requestPublish({
          verdict: data.qualityVerdict,
          checkedAt: data.qualityCheckedAt,
        }))
      }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      toast.success("公開しました。")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`公開失敗: ${message}`)
    } finally {
      setIsPublishing(null)
    }
  }

  async function handleCleanupUnsynthesized() {
    if (counts.unsynthesized === 0) return
    if (
      !window.confirm(
        `未合成の下書き ${counts.unsynthesized} 件をすべて削除します。よろしいですか？`,
      )
    )
      return
    setIsCleaningUp(true)
    const targets = articles.filter((a) => a.isSynthesized === false)
    let deleted = 0
    let failed = 0
    for (const article of targets) {
      try {
        const response = await fetch(`/api/admin/articles/${article.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        })
        if (response.ok) deleted += 1
        else failed += 1
      } catch {
        failed += 1
      }
    }
    setIsCleaningUp(false)
    if (failed === 0) {
      toast.success(`未合成の下書き ${deleted} 件を削除しました。`)
    } else {
      toast.warning(`削除 ${deleted} 件 / 失敗 ${failed} 件`)
    }
    router.refresh()
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch {
      // ignore
    }
    router.replace("/admin/login")
    router.refresh()
  }

  async function handleRunScrape() {
    setIsScraping(true)
    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        credentials: "same-origin",
      })
      const data = (await response.json()) as {
        ok?: boolean
        error?: string
        fetchErrors?: Array<{ connectorId?: string; error?: string }>
        summary?: {
          fetched?: number
          published?: number
          reviewQueue?: number
          failed?: number
          inserted?: number
          skipped?: number
        }
      }

      if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`)
      if (!data.ok) throw new Error(data.error ?? "スクレイピング実行に失敗しました")

      if ((data.summary?.fetched ?? 0) === 0) {
        const errorCount = Array.isArray(data.fetchErrors) ? data.fetchErrors.length : 0
        toast.warning(`取得 0件。フィードエラー ${errorCount} 件`)
        return
      }
      const { fetched = 0, inserted = 0, skipped = 0, published = 0, reviewQueue = 0 } =
        data.summary ?? {}
      toast.success(
        `取得 ${fetched} / 合成 ${published + reviewQueue} / 新規保存 ${inserted}${skipped ? ` (重複 ${skipped})` : ""}`,
      )
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      toast.error(`スクレイピング失敗: ${message}`)
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">サイトへ戻る</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
                記事管理
              </h1>
              {counts.review > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusTab("review")}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20"
                  title="要確認の記事へジャンプ"
                >
                  <AlertTriangle className="size-3" />
                  要確認 {counts.review}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">新規追加</span>
            </Button>
            <Button
              onClick={handleRunScrape}
              variant="outline"
              size="sm"
              disabled={isScraping}
              title="RSS取得 + AI合成パイプラインを今すぐ実行"
            >
              <RefreshCw className={`size-4 ${isScraping ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isScraping ? "実行中…" : "スクレイピング"}
              </span>
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm" title="ログアウト">
              <LogOut className="size-4" />
              <span className="sr-only sm:not-sr-only sm:inline">ログアウト</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
          {STATUS_TAB_ORDER.map((tab) => {
            const count = counts[tab]
            const isActive = statusTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {STATUS_TAB_LABELS[tab]}
                <span
                  className={`text-xs tabular-nums ${
                    isActive ? "opacity-80" : "opacity-60"
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {counts.unsynthesized > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  未合成の下書きが {counts.unsynthesized} 件あります
                </p>
                <p className="text-muted-foreground">
                  LLMで生成されていない古い下書きで、本文・本記事のポイントが定型文です。一括削除を推奨します。
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupUnsynthesized}
              disabled={isCleaningUp}
            >
              <Trash2 className="size-4" />
              {isCleaningUp ? "削除中…" : `${counts.unsynthesized} 件を一括削除`}
            </Button>
          </div>
        )}

        <GenerationStats />

        <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,_1fr)]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="タイトル・要約・本記事のポイントで検索"
                className="pl-9"
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as Category | "all")}
            >
              <SelectTrigger>
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={qualityFilter}
              onValueChange={(value) => setQualityFilter(value as QualityFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="AI品質" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(QUALITY_FILTER_LABELS) as QualityFilter[]).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {QUALITY_FILTER_LABELS[key]}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={sortBasis}
              onValueChange={(value) => setSortBasis(value as SortBasis)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_BASIS_LABELS) as SortBasis[]).map((basis) => (
                  <SelectItem key={basis} value={basis}>
                    {SORT_BASIS_LABELS[basis]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) => setSortOrder(value as SortOrder)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortOrder[]).map((order) => (
                  <SelectItem key={order} value={order}>
                    {SORT_LABELS[order]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <span>
                {filteredArticles.length} 件 / {articles.length} 件中
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-secondary"
              >
                <X className="size-3" />
                フィルタをクリア
              </button>
            </div>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "条件に一致する記事はありません。"
                : "まだ記事がありません。"}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 inline-flex items-center gap-1 text-sm text-foreground underline-offset-2 hover:underline"
              >
                <X className="size-3" />
                フィルタをクリア
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <AdminArticleCard
                key={article.id}
                article={article}
                isPublishing={isPublishing === article.id}
                onPublish={() => handlePublish(article)}
                onEdit={() => openEditDialog(article.id)}
                onDelete={() => handleDelete(article.id, article.title)}
              />
            ))}
          </div>
        )}
      </main>

      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />
    </div>
  )
}

interface AdminArticleCardProps {
  article: NewsArticle
  isPublishing: boolean
  onPublish: () => void
  onEdit: () => void
  onDelete: () => void
}

function AdminArticleCard({
  article,
  isPublishing,
  onPublish,
  onEdit,
  onDelete,
}: AdminArticleCardProps) {
  const isReview = article.workflowStatus === "review"
  const isPublished = article.workflowStatus === "published"
  const isUnsynthesized = article.isSynthesized === false
  const pointCount = article.implications.filter((point) => point.trim()).length
  const hasBackground = Boolean(article.backgroundContext?.trim())
  const hasImpact = Boolean(article.japanBusinessImpact?.trim())
  const keywordCount = article.keywords?.length ?? 0

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start ${
        isUnsynthesized
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border bg-card"
      }`}
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-secondary/40 sm:h-24 sm:w-32 md:h-28 md:w-40">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 160px, (min-width: 640px) 128px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={isPublished ? "default" : "outline"}
            className={
              isReview
                ? "border-amber-500/50 text-amber-700"
                : article.workflowStatus === "failed"
                  ? "border-red-500/50 text-red-700"
                  : ""
            }
          >
            {WORKFLOW_STATUS_LABELS[article.workflowStatus]}
          </Badge>
          {article.isSynthesized === false && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-700">
              <AlertTriangle className="size-3" />
              未合成の下書き
            </Badge>
          )}
          {article.qualityCheck && (
            <Badge
              variant="outline"
              className={QUALITY_VERDICT_BADGE_CLASS[article.qualityCheck.verdict]}
            >
              {QUALITY_VERDICT_LABELS[article.qualityCheck.verdict]}
              {article.qualityCheck.revisionCount > 0
                ? `(再生成${article.qualityCheck.revisionCount}回)`
                : ""}
            </Badge>
          )}
          <Badge variant="outline">{CATEGORY_LABELS[article.category]}</Badge>
          <span className="break-all font-mono text-xs text-muted-foreground">
            記事ID {article.id}
          </span>
          {article.createdAt && (
            <span className="text-xs text-muted-foreground tabular-nums">
              生成 {formatJstDateTime(article.createdAt)}
            </span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums">
            原文 {formatJstDate(article.publishedAt)}
          </span>
        </div>

        <AdminCardSources article={article} />

        <div className="space-y-1.5">
          <h2 className="text-base font-semibold leading-snug text-foreground">
            {article.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {article.summary}
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground"
          aria-label="記事補助項目の入力状況"
        >
          <span className={pointCount === 3 ? "text-emerald-700" : ""}>
            ポイント {pointCount}/3
          </span>
          <span className={hasBackground ? "text-emerald-700" : ""}>
            背景 {hasBackground ? "✓" : "—"}
          </span>
          <span className={hasImpact ? "text-emerald-700" : ""}>
            影響 {hasImpact ? "✓" : "—"}
          </span>
          <span className={keywordCount > 0 ? "text-emerald-700" : ""}>
            用語 {keywordCount}
          </span>
        </div>

        {article.marketSnapshot && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {MARKET_METRIC_ORDER.map((key) => {
              const metric = article.marketSnapshot?.[key]
              if (!metric) return null

              return (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-secondary/30 px-3 py-2"
                >
                  <p className="text-xs font-medium text-foreground">
                    {metric.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {metric.value} {metric.unit}
                  </p>
                  <p className="text-xs text-foreground">{metric.change}</p>
                </div>
              )
            })}
          </div>
        )}

        {article.industryTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.industryTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[11px]">
                {INDUSTRY_LABELS[tag]}
              </Badge>
            ))}
          </div>
        )}

        {article.qualityCheck &&
          article.qualityCheck.verdict !== "PASS" &&
          article.qualityCheck.notes && (
            <details className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-900">
              <summary className="cursor-pointer font-medium">
                AI品質チェックの指摘
              </summary>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-amber-900/90">
                {article.qualityCheck.notes}
              </pre>
            </details>
          )}
      </div>

      <div className="flex shrink-0 flex-row flex-wrap items-center gap-1.5 sm:flex-col sm:items-stretch">
        {isReview && article.isSynthesized && (
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isPublishing}
            className="w-full justify-start sm:justify-center"
          >
            <Send className="size-4" />
            {isPublishing ? "公開中…" : "公開する"}
          </Button>
        )}
        {isPublished ? (
          <Button asChild variant="outline" size="sm">
            <Link href={`/article/${article.id}`} target="_blank">
              <Eye className="size-4" />
              <span className="sm:hidden">表示</span>
              <span className="hidden sm:inline">プレビュー</span>
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Eye className="size-4" />
            <span className="hidden sm:inline">非公開</span>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="size-4" />
          <span className="hidden sm:inline">編集</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">削除</span>
        </Button>
      </div>
    </article>
  )
}

function AdminCardSources({ article }: { article: NewsArticle }) {
  const sources = getAllSources(article)
  if (sources.length === 0) return null

  return (
    <details className="rounded-xl border border-border bg-secondary/20 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-medium text-muted-foreground">
        参考記事 {sources.length} 件
      </summary>
      <ul className="mt-2 space-y-1.5 text-foreground">
        {sources.map((src, idx) => (
          <li key={`${idx}-${src.originalUrl ?? src.originalTitle}`}>
            {src.originalUrl ? (
              <a
                href={src.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 underline-offset-2 hover:text-accent hover:underline"
              >
                <span className="line-clamp-1">{src.originalTitle}</span>
                <ExternalLink className="mt-0.5 size-3 shrink-0" />
              </a>
            ) : (
              <span className="line-clamp-1">{src.originalTitle}</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  )
}
