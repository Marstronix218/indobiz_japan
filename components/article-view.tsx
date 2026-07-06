"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { MarketTicker } from "@/components/market-ticker"
import { ColumnAuthorCard } from "@/components/column-author-card"
import { NewsCardTile } from "@/components/news-card"
import {
  CitySpotlightWidget,
  MarketIndicatorWidget,
  TrendingWidget,
} from "@/components/sidebar-widgets"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  articleDisplayDate,
  formatArticleDate,
  formatJstDateTime,
  getAllSources,
  type SourceProvenance,
} from "@/lib/news-data"
import { formatSummaryParagraphs } from "@/lib/summary-utils"
import { ensureMinimumSummaryLength } from "@/lib/summary-utils"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { resolveArticleAuthor } from "@/lib/authors"
import { recordArticleViewClient } from "@/lib/view-tracking"

const TITLE_SOURCE_SUFFIX =
  /\s+(?:[-–—|])\s+(?:reuters|associated press|ap news|bloomberg|bbc|cnn|cnbc|financial times|the hindu|hindustan times|times of india|the economic times|the new indian express|indian express|mint|moneycontrol|business standard|ndtv|deccan herald|firstpost|the print|pib)$/i

const SOURCE_DOMAIN_LABELS: Record<string, string> = {
  "news.google.com": "Google News",
  "timesofindia.indiatimes.com": "Times of India",
  "economictimes.indiatimes.com": "The Economic Times",
  "business-standard.com": "Business Standard",
  "www.business-standard.com": "Business Standard",
  "businesstoday.in": "Business Today",
  "www.businesstoday.in": "Business Today",
  "thehindu.com": "The Hindu",
  "www.thehindu.com": "The Hindu",
  "hindustantimes.com": "Hindustan Times",
  "www.hindustantimes.com": "Hindustan Times",
  "livemint.com": "Mint",
  "www.livemint.com": "Mint",
  "moneycontrol.com": "Moneycontrol",
  "www.moneycontrol.com": "Moneycontrol",
  "reuters.com": "Reuters",
  "www.reuters.com": "Reuters",
  "ndtv.com": "NDTV",
  "www.ndtv.com": "NDTV",
  "pib.gov.in": "PIB",
}

const DOMAIN_WORD_OVERRIDES: Record<string, string> = {
  ai: "AI",
  ap: "AP",
  bbc: "BBC",
  cnbc: "CNBC",
  cnn: "CNN",
  et: "ET",
  ndtv: "NDTV",
  pib: "PIB",
}

function isAggregateSourceLabel(value: string | undefined) {
  if (!value) return false
  return /、他(?:\d+件)?$/.test(value.trim())
}

function publisherFromUrl(url: string | undefined) {
  if (!url) return undefined
  try {
    const host = new URL(url).hostname.toLowerCase()
    return SOURCE_DOMAIN_LABELS[host] ?? formatDomainLabel(host)
  } catch {
    return undefined
  }
}

function formatDomainLabel(host: string) {
  const withoutWww = host.replace(/^www\./, "")
  const parts = withoutWww.split(".").filter(Boolean)
  const core =
    parts.length >= 3 && ["co", "com", "org", "net"].includes(parts.at(-2) ?? "")
      ? parts.at(-3)
      : parts.length >= 2
        ? parts.at(-2)
        : parts[0]

  return (core ?? withoutWww)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => {
      const override = DOMAIN_WORD_OVERRIDES[word]
      if (override) return override
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}

function cleanReferenceTitle(title: string) {
  return title.replace(TITLE_SOURCE_SUFFIX, "").trim()
}

function getSourceLabel(source: SourceProvenance, fallback: string) {
  const raw = source.sourceName || fallback
  if (raw && !isAggregateSourceLabel(raw)) return raw
  return publisherFromUrl(source.originalUrl) || raw?.replace(/、他(?:\d+件)?$/, "") || "Source"
}

function normalizeTitleForCompare(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

function isGenericReferenceTitle(
  title: string,
  source: SourceProvenance,
  articleSource: string,
) {
  const cleaned = cleanReferenceTitle(title)
  if (!cleaned || isAggregateSourceLabel(cleaned)) return true

  const titleKey = normalizeTitleForCompare(cleaned)
  const labels = [
    source.sourceName,
    articleSource,
    publisherFromUrl(source.originalUrl),
    source.sourceName?.replace(/、他(?:\d+件)?$/, ""),
    articleSource.replace(/、他(?:\d+件)?$/, ""),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeTitleForCompare)

  return labels.some((label) => label === titleKey)
}

function titleFromUrl(url: string | undefined) {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    const skipped = new Set([
      "amp",
      "articleshow",
      "business",
      "business-news",
      "companies",
      "economy",
      "india",
      "india-business",
      "industry",
      "latest",
      "markets",
      "news",
      "story",
    ])
    const segments = parsed.pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment).trim())
      .filter(Boolean)

    for (let index = segments.length - 1; index >= 0; index -= 1) {
      const raw = segments[index]
        .replace(/\.(?:cms|html?|amp)$/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
      const lower = raw.toLowerCase()
      if (!raw || raw.length < 12 || /^\d+$/.test(raw) || skipped.has(lower)) {
        continue
      }
      return raw.charAt(0).toUpperCase() + raw.slice(1)
    }
  } catch {
    return undefined
  }
  return undefined
}

function getReferenceDisplayTitle(
  source: SourceProvenance,
  articleSource: string,
  articleTitle: string,
) {
  const cleaned = cleanReferenceTitle(source.originalTitle || "")
  if (cleaned && !isGenericReferenceTitle(cleaned, source, articleSource)) {
    return cleaned
  }
  return titleFromUrl(source.originalUrl) || articleTitle
}

function SourceArticleCarousel({
  sources,
  articleSource,
  articleTitle,
  articlePublishedAt,
}: {
  sources: SourceProvenance[]
  articleSource: string
  articleTitle: string
  articlePublishedAt: string
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateState()
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => updateState()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateState)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [updateState, sources.length])

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-source-card]")
    const cardWidth = card?.offsetWidth ?? el.clientWidth / 3
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: direction * (cardWidth + gap) * 3, behavior: "smooth" })
  }

  return (
    <div className="relative min-w-0 overflow-x-hidden">
      <div
        ref={scrollerRef}
        className="-mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {sources.map((src, idx) => {
          const sourceName = getSourceLabel(src, articleSource)
          const sourceTitle = getReferenceDisplayTitle(
            src,
            articleSource,
            articleTitle,
          )
          const sourceDate = formatArticleDate(
            src.originalPublishedAt ?? articlePublishedAt,
          )
          const card = (
            <>
              <p className="font-serif text-base font-bold leading-tight text-primary">
                {sourceName}
              </p>
              <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-foreground">
                {sourceTitle}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{sourceDate}</span>
                {src.originalUrl && (
                  <ExternalLink className="size-4 text-primary" />
                )}
              </div>
            </>
          )

          return (
            <div
              key={`${idx}-${src.originalUrl || src.originalTitle}`}
              data-source-card
              className="w-[82vw] max-w-[22rem] shrink-0 snap-start sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc((100%-32px)/3)]"
            >
              {src.originalUrl ? (
                <a
                  href={src.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-md border border-border bg-background p-4 transition-colors hover:border-primary"
                >
                  {card}
                </a>
              ) : (
                <div className="h-full rounded-md border border-border bg-background p-4">
                  {card}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {sources.length > 3 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="前へ"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            className="grid size-8 place-items-center rounded-full border border-border bg-card text-foreground transition-opacity hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="次へ"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            className="grid size-8 place-items-center rounded-full border border-border bg-card text-foreground transition-opacity hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ArticleView({
  id,
}: {
  id: string
}) {
  const articles = usePublicArticles()
  const article = articles.find((item) => item.id === id)

  useEffect(() => {
    if (!article) return
    recordArticleViewClient(article.id)
  }, [article?.id])

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">
            記事が見つかりません
          </h1>
          <Link href="/" className="mt-3 inline-block text-sm text-accent hover:underline">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const relatedArticles = articles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .slice(0, 3)
  const isEditorial =
    article.contentType !== "news" || article.category === "column"
  const columnAuthor = isEditorial ? resolveArticleAuthor(article) : null
  const detailedSummary = isEditorial
    ? article.summary.trim()
    : ensureMinimumSummaryLength(article.summary, 500)
  const summaryParagraphs = formatSummaryParagraphs(detailedSummary)
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const allSources = getAllSources(article)
  const sourceCards: SourceProvenance[] =
    allSources.length > 0
      ? allSources
      : article.sourceUrl
        ? [
            {
              originalTitle: article.title,
              originalUrl: article.sourceUrl,
              originalPublishedAt: article.publishedAt,
              sourceName: article.source,
            },
          ]
        : []
  const takeawayBullets =
    article.implications.length > 0
      ? article.implications.slice(0, 3)
      : summaryParagraphs.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <MarketTicker />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav
          aria-label="パンくず"
          className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-muted-foreground"
        >
          <Link href="/" className="shrink-0 hover:text-foreground">
            トップ
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <Link
            href={`/?category=${article.category}`}
            className="shrink-0 hover:text-foreground"
          >
            {CATEGORY_LABELS[article.category]}
          </Link>
          {article.industryTags.length > 0 && (
            <>
              <ChevronRight className="size-3.5 shrink-0" />
              <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-secondary/60 px-2 py-0.5">
                {article.industryTags.map((tag, index) => (
                  <span key={tag} className="inline-flex items-center gap-1">
                    <Link
                      href={`/?tag=${tag}`}
                      className="hover:text-foreground"
                    >
                      {INDUSTRY_LABELS[tag]}
                    </Link>
                    {index < article.industryTags.length - 1 && (
                      <span className="text-muted-foreground/60">・</span>
                    )}
                  </span>
                ))}
              </span>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate">{article.title}</span>
        </nav>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_336px]">
          <article className="min-w-0 rounded-md border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-7">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  asChild
                  className={`${CATEGORY_COLORS[article.category]} rounded-sm border-none px-2 py-1 text-[11px]`}
                >
                  <Link href={`/?category=${article.category}`}>
                    {CATEGORY_LABELS[article.category]}
                  </Link>
                </Badge>
                {article.industryTags.map((tag) => (
                  <Badge
                    key={tag}
                    asChild
                    variant="outline"
                    className="rounded-sm border-border bg-white px-2 py-1 text-[11px] text-foreground hover:border-primary hover:bg-secondary/40"
                  >
                    <Link href={`/?tag=${tag}`}>{INDUSTRY_LABELS[tag]}</Link>
                  </Badge>
                ))}
              </div>

              <div className="space-y-3">
                <h1 className="text-balance font-serif text-[28px] font-bold leading-[1.38] tracking-tight text-foreground sm:text-[38px]">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatJstDateTime(articleDisplayDate(article))}</span>
                  <span aria-hidden>｜</span>
                  <span>IndoBiz Japan編集部</span>
                </div>
              </div>
            </div>

            {takeawayBullets.length > 0 && (
              <section className="mt-5 rounded-md border border-primary/25 bg-primary/5 p-4 sm:p-5">
                <h2 className="text-base font-bold text-primary">
                  本記事のポイント
                </h2>
                <ul className="mt-3 space-y-2.5 pl-4 text-base leading-8 text-foreground sm:text-[17px]">
                  {takeawayBullets.map((item, index) => (
                    <li key={`${index}-${item}`} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {imageSrc && (
              <div className="relative mx-auto mt-5 aspect-[16/9] w-full max-w-[620px] overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={imageSrc}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 620px"
                />
              </div>
            )}

            <section className="mt-6 space-y-4">
              {summaryParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="whitespace-pre-line text-[17px] leading-9 text-foreground sm:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </section>

            {columnAuthor && <ColumnAuthorCard author={columnAuthor} />}

            {article.marketSnapshot && (
              <section className="mt-7 border-t border-border pt-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  関連マーケット指標
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {MARKET_METRIC_ORDER.map((key) => {
                    const metric = article.marketSnapshot?.[key]
                    if (!metric) return null

                    return (
                      <div
                        key={key}
                        className="rounded-md border border-border bg-secondary/30 p-4"
                      >
                        <p className="text-xs font-medium text-foreground">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                          {metric.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{metric.unit}</p>
                        <p
                          className={`mt-2 text-xs font-medium ${
                            metric.change.startsWith("-")
                              ? "text-rose-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {metric.change}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {metric.asOf}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {sourceCards.length > 0 && (
              <section className="mt-8 border-t border-border pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-primary">
                    参考記事
                  </h2>
                  <ExternalLink className="size-4 text-primary" />
                </div>
                <SourceArticleCarousel
                  sources={sourceCards}
                  articleSource={article.source}
                  articleTitle={article.title}
                  articlePublishedAt={article.publishedAt}
                />
              </section>
            )}

            {relatedArticles.length > 0 && (
              <section className="mt-8 border-t border-border pt-6">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="size-2.5 rounded-sm bg-accent" />
                    <h2 className="font-serif text-2xl font-bold tracking-tight">
                      関連記事
                    </h2>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      // RELATED
                    </span>
                  </div>
                </div>
                <div className="topic-rule mb-6" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <NewsCardTile key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-4 self-start lg:sticky lg:top-4">
            <TrendingWidget />
            <MarketIndicatorWidget />
            <CitySpotlightWidget />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
