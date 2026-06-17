"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getArticleById } from "@/lib/article-store"
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  DEFAULT_MARKET_SNAPSHOT,
  getAllSources,
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  MARKET_METRIC_ORDER,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_STATUS_OPTIONS,
  type Category,
  type IndustryTag,
  type MarketSnapshot,
  type SourceProvenance,
  type WorkflowStatus,
} from "@/lib/news-data"
import { toast } from "sonner"

/**
 * The articles table stores `published_at` as an ISO timestamp like
 * `2026-05-26T00:00:00+00:00`. An <input type="date"> only accepts/emits
 * `YYYY-MM-DD`, so we strip the time on load and reattach a UTC midnight
 * on save when the date changed. If the user didn't touch the date, we
 * keep the original ISO string verbatim so the JST/IST time isn't lost.
 */
function toDateInputValue(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function reconstructIsoFromDateInput(
  dateInput: string,
  originalIso: string | undefined,
): string {
  if (originalIso && toDateInputValue(originalIso) === dateInput) {
    return originalIso
  }
  return `${dateInput}T00:00:00.000Z`
}

interface ArticleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: string | null
}

interface ArticleFormState {
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  originalPublishedAt: string | undefined
  category: Category
  industryTags: IndustryTag[]
  implicationsText: string
  workflowStatus: WorkflowStatus
  imageUrl: string
  featured: boolean
  marketSnapshot: MarketSnapshot
  referenceSources: SourceProvenance[]
}

const EMPTY_FORM: ArticleFormState = {
  title: "",
  summary: "",
  source: "編集部",
  sourceUrl: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  originalPublishedAt: undefined,
  category: "economy",
  industryTags: [],
  implicationsText: "",
  workflowStatus: "published",
  imageUrl: "",
  featured: false,
  marketSnapshot: DEFAULT_MARKET_SNAPSHOT,
  referenceSources: [],
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  editingId,
}: ArticleFormDialogProps) {
  const router = useRouter()
  const [form, setForm] = useState<ArticleFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const isEditing = editingId !== null

  async function handleGenerateImage() {
    if (generatingImage || uploadingImage) return
    if (!form.title.trim()) {
      toast.error("画像生成にはタイトルが必要です。")
      return
    }
    setGeneratingImage(true)
    try {
      const response = await fetch("/api/admin/generate-image", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, summary: form.summary }),
      })
      const data = (await response.json()) as {
        ok?: boolean
        url?: string
        error?: string
      }
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      setForm((current) => ({ ...current, imageUrl: data.url ?? "" }))
      toast.success("画像を生成しました。「更新する」で保存されます。")
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`画像生成失敗: ${message}`)
    } finally {
      setGeneratingImage(false)
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      })
      const data = (await response.json()) as {
        ok?: boolean
        url?: string
        error?: string
      }
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      setForm((current) => ({ ...current, imageUrl: data.url ?? "" }))
      toast.success("画像をアップロードしました。")
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`アップロード失敗: ${message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    if (!open) return

    if (!editingId) {
      setForm({
        ...EMPTY_FORM,
        publishedAt: new Date().toISOString().slice(0, 10),
        originalPublishedAt: undefined,
        marketSnapshot: DEFAULT_MARKET_SNAPSHOT,
      })
      return
    }

    const article = getArticleById(editingId)
    if (!article) return

    setForm({
      title: article.title,
      summary: article.summary,
      source: article.source,
      sourceUrl: article.sourceUrl ?? "",
      publishedAt: toDateInputValue(article.publishedAt),
      originalPublishedAt: article.publishedAt,
      category: article.category,
      industryTags: article.industryTags,
      implicationsText: article.implications.join("\n"),
      workflowStatus: article.workflowStatus,
      imageUrl: article.imageUrl ?? "",
      featured: article.featured ?? false,
      marketSnapshot: article.marketSnapshot ?? DEFAULT_MARKET_SNAPSHOT,
      referenceSources: getAllSources(article),
    })
  }, [editingId, open])

  function toggleIndustry(tag: IndustryTag) {
    setForm((current) => ({
      ...current,
      industryTags: current.industryTags.includes(tag)
        ? current.industryTags.filter((item) => item !== tag)
        : [...current.industryTags, tag],
    }))
  }

  function updateMarketField(
    key: keyof MarketSnapshot,
    field: keyof MarketSnapshot[keyof MarketSnapshot],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      marketSnapshot: {
        ...current.marketSnapshot,
        [key]: {
          ...current.marketSnapshot[key],
          [field]: value,
        },
      },
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const implications = form.implicationsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)

    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("タイトルと要約は必須です。")
      return
    }

    const visibility =
      form.workflowStatus === "published" ? "public" : "member"

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      source: form.source.trim() || "編集部",
      sourceUrl: form.sourceUrl.trim() || undefined,
      publishedAt: reconstructIsoFromDateInput(
        form.publishedAt,
        form.originalPublishedAt,
      ),
      category: form.category,
      industryTags: form.industryTags,
      implications,
      contentType: "news",
      visibility,
      workflowStatus: form.workflowStatus,
      imageUrl: form.imageUrl.trim() || undefined,
      featured: form.featured,
      marketSnapshot:
        form.category === "market" ? form.marketSnapshot : undefined,
    }

    setSubmitting(true)
    try {
      const endpoint = editingId
        ? `/api/admin/articles/${editingId}`
        : "/api/admin/articles"
      const method = editingId ? "PATCH" : "POST"
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      toast.success(editingId ? "記事を更新しました。" : "記事を追加しました。")
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`保存失敗: ${message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>{isEditing ? "記事を編集" : "記事を追加"}</DialogTitle>
          <DialogDescription>
            必須は タイトル / 要約 / 出典 のみ。他は任意です。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">
              タイトル <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="記事タイトルを入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">
              本文・要約 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              placeholder="記事の本文を入力"
              className="min-h-44"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">出典名（メタ情報）</Label>
              <Input
                id="source"
                value={form.source}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    source: event.target.value,
                  }))
                }
                placeholder="編集部 / Reuters など"
              />
              <p className="text-xs text-muted-foreground">
                公開ページには表示されません。手動投稿時の編集者名や主要参照元として記録します。
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">出典 URL（任意）</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={form.sourceUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sourceUrl: event.target.value,
                  }))
                }
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                参考記事一覧が空のときのフォールバックとしてのみ使用されます。
              </p>
            </div>
          </div>

          {form.referenceSources.length > 0 && (
            <div className="space-y-2 rounded-2xl border border-border bg-secondary/20 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <Label className="text-sm">
                  参考記事 {form.referenceSources.length} 件
                </Label>
                <span className="text-xs text-muted-foreground">
                  パイプラインが自動付与（編集不可）
                </span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {form.referenceSources.map((src, idx) => (
                  <li key={`${idx}-${src.originalUrl ?? src.originalTitle}`}>
                    {src.originalUrl ? (
                      <a
                        href={src.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1 text-foreground underline-offset-2 hover:text-accent hover:underline"
                      >
                        {src.originalTitle}
                      </a>
                    ) : (
                      <span className="line-clamp-1 text-foreground">
                        {src.originalTitle}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                記事ページの「参考記事」セクションにこのまま表示されます。
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value as Category,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>公開状態</Label>
              <Select
                value={form.workflowStatus}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    workflowStatus: value as WorkflowStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {WORKFLOW_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">公開日</Label>
              <Input
                id="publishedAt"
                type="date"
                value={form.publishedAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    publishedAt: event.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                変更しなければ取得時刻（時分）はそのまま保持されます。
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">画像（任意）</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                placeholder="https://... または下のボタンからアップロード"
              />
              <div className="flex items-center gap-3">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage || generatingImage}
                  className="cursor-pointer text-xs file:mr-3 file:cursor-pointer"
                />
                {uploadingImage && (
                  <span className="text-xs text-muted-foreground">
                    アップロード中…
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={generatingImage || uploadingImage}
                >
                  <Sparkles className="size-4" />
                  {generatingImage
                    ? "生成中…"
                    : form.imageUrl
                      ? "画像を再生成"
                      : "画像を生成"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  タイトル・要約からAI画像を生成します（「更新する」で保存）。
                </span>
              </div>
              {form.imageUrl && !uploadingImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt="プレビュー"
                  className="mt-1 h-32 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>業界タグ（任意）</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {INDUSTRY_OPTIONS.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={form.industryTags.includes(tag)}
                    onCheckedChange={() => toggleIndustry(tag)}
                  />
                  <span>{INDUSTRY_LABELS[tag]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="implicationsText">日本企業への示唆（任意）</Label>
            <Textarea
              id="implicationsText"
              value={form.implicationsText}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  implicationsText: event.target.value,
                }))
              }
              placeholder={"1行につき1つ。空欄でも保存できます。\n勝機あり: ...\n注意点: ..."}
              className="min-h-24"
            />
            <p className="text-xs text-muted-foreground">
              入力した場合のみ記事下部に箇条書きで表示されます。
            </p>
          </div>

          {form.category === "market" && (
            <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  為替・市況4指標
                </p>
                <p className="text-xs text-muted-foreground">
                  為替・株式・金利・原油の順で表示します。
                </p>
              </div>
              {MARKET_METRIC_ORDER.map((key) => {
                const metric = form.marketSnapshot[key]
                return (
                  <div key={key} className="grid gap-3 md:grid-cols-5">
                    <div className="space-y-2">
                      <Label>{metric.label} 表示名</Label>
                      <Input
                        value={metric.label}
                        onChange={(event) =>
                          updateMarketField(key, "label", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>値</Label>
                      <Input
                        value={metric.value}
                        onChange={(event) =>
                          updateMarketField(key, "value", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>変化</Label>
                      <Input
                        value={metric.change}
                        onChange={(event) =>
                          updateMarketField(key, "change", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>単位</Label>
                      <Input
                        value={metric.unit}
                        onChange={(event) =>
                          updateMarketField(key, "unit", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>更新時刻</Label>
                      <Input
                        value={metric.asOf}
                        onChange={(event) =>
                          updateMarketField(key, "asOf", event.target.value)
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
            <Checkbox
              checked={form.featured}
              onCheckedChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  featured: checked === true,
                }))
              }
            />
            <span>トップの注目記事として表示する</span>
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中…" : isEditing ? "更新する" : "追加する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
