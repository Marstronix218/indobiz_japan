"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NewsCardHero, NewsCardMosaic } from "@/components/news-card"
import { TopicCarousel } from "@/components/topic-carousel"
import { TopicHeader } from "@/components/topic-header"
import { MarketTicker } from "@/components/market-ticker"
import {
  EditorialColumnWidget,
  TrendingWidget,
  MarketIndicatorWidget,
  CitySpotlightWidget,
} from "@/components/sidebar-widgets"
import { GooeyGradientBackground } from "@/components/gooey-gradient-background"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SiteIntro } from "@/components/site-intro"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_OPTIONS,
  CATEGORY_SECTIONS,
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  articleDisplayDate,
  computePopularityScore,
  type Category,
  type IndustryTag,
  type NewsArticle,
} from "@/lib/news-data"

export function NewsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const publicArticles = usePublicArticles()

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const nextCategory = CATEGORY_OPTIONS.includes(categoryParam as Category)
      ? (categoryParam as Category)
      : null

    const nextTags = searchParams
      .getAll("tag")
      .filter((tag): tag is IndustryTag =>
        INDUSTRY_OPTIONS.includes(tag as IndustryTag),
      )

    setActiveCategory(nextCategory)
    setSelectedIndustries(nextTags)
    setSearchQuery(searchParams.get("q") ?? "")
  }, [searchParams])

  const showIndustryFilter = activeCategory === "economy" || selectedIndustries.length > 0

  const sortedArticles = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    const industryFilterActive = selectedIndustries.length > 0
    const now = Date.now()

    return [...publicArticles]
      .filter((article) => {
        const matchesCategory =
          activeCategory === null || article.category === activeCategory

        const matchesIndustry =
          !industryFilterActive ||
          article.industryTags.some((tag) => selectedIndustries.includes(tag))

        const haystack = [
          article.title,
          article.summary,
          article.source,
          ...article.implications,
        ]
          .join(" ")
          .toLowerCase()

        const matchesQuery = !query || haystack.includes(query)

        return matchesCategory && matchesIndustry && matchesQuery
      })
      .sort((left, right) => {
        const diff =
          computePopularityScore(right, now) - computePopularityScore(left, now)
        if (diff !== 0) return diff
        return (
          new Date(articleDisplayDate(right)).getTime() -
          new Date(articleDisplayDate(left)).getTime()
        )
      })
  }, [
    activeCategory,
    deferredSearchQuery,
    publicArticles,
    selectedIndustries,
    showIndustryFilter,
  ])

  const [hero, mosaic1, mosaic2, mosaic3, ...rest] = sortedArticles

  const filterActive =
    activeCategory !== null ||
    (showIndustryFilter && selectedIndustries.length > 0) ||
    deferredSearchQuery.trim().length > 0

  const sectionsByCategory = useMemo(() => {
    const buckets = new Map<Category, NewsArticle[]>()
    for (const section of CATEGORY_SECTIONS) buckets.set(section.key, [])
    for (const article of rest) {
      buckets.get(article.category)?.push(article)
    }
    return buckets
  }, [rest])

  function toggleIndustry(tag: IndustryTag) {
    setSelectedIndustries((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  function clearFilters() {
    setActiveCategory(null)
    setSelectedIndustries([])
    setSearchQuery("")
    router.push("/")
  }

  const industryFilterApplied =
    showIndustryFilter && selectedIndustries.length > 0
  const hasResults = sortedArticles.length > 0

  return (
    <div className="min-h-screen bg-background">
      {filterActive ? (
        <SiteHeader />
      ) : (
        <GooeyGradientBackground
          className="text-white"
          contentClassName="bg-black/25"
        >
          <SiteHeader withBackground={false} />
          <SiteIntro withBackground={false} />
        </GooeyGradientBackground>
      )}
      <MarketTicker />

      <main
        className={`mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 ${
          filterActive ? "pt-4" : "pt-8"
        }`}
      >
        {showIndustryFilter ? (
          <IndustryFilterPanel
            selectedIndustries={selectedIndustries}
            resultCount={sortedArticles.length}
            onToggle={toggleIndustry}
            onClear={clearFilters}
          />
        ) : filterActive ? (
          <FilterSummary resultCount={sortedArticles.length} onClear={clearFilters} />
        ) : null}

        {hasResults ? (
          <>
            {hero && (
              <section className="mb-12 grid gap-3 lg:grid-cols-2">
                <div className="lg:min-h-[30rem]">
                  <NewsCardHero
                    article={hero}
                    className="h-full lg:aspect-auto"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:min-h-[30rem] lg:grid-rows-2">
                  {mosaic1 && (
                    <div className="sm:col-span-2">
                      <NewsCardMosaic
                        article={mosaic1}
                        className="aspect-[16/10] lg:aspect-auto"
                        priority
                      />
                    </div>
                  )}
                  {mosaic2 && (
                    <NewsCardMosaic
                      article={mosaic2}
                      className="aspect-[16/10] lg:aspect-auto"
                      priority
                    />
                  )}
                  {mosaic3 && (
                    <NewsCardMosaic
                      article={mosaic3}
                      className="aspect-[16/10] lg:aspect-auto"
                    />
                  )}
                </div>
              </section>
            )}

            <div className="grid min-w-0 gap-10 lg:grid-cols-4">
              <div className="min-w-0 space-y-12 lg:col-span-3">
                {filterActive ? (
                  <FilteredResults articles={rest} />
                ) : (
                  CATEGORY_SECTIONS.map((section) => {
                    const items = sectionsByCategory.get(section.key) ?? []
                    if (items.length === 0) return null
                    return (
                      <section key={section.key} className="min-w-0">
                        <TopicHeader section={section} count={items.length} />
                        <TopicCarousel articles={items} />
                      </section>
                    )
                  })
                )}

              </div>

              <aside className="space-y-5 self-start lg:col-span-1 lg:sticky lg:top-4">
                <EditorialColumnWidget />
                <TrendingWidget />
                <MarketIndicatorWidget />
                <CitySpotlightWidget />
              </aside>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-base leading-8 text-muted-foreground">
            条件に合う記事が見つかりませんでした。
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

function FilteredResults({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null
  return (
    <section className="min-w-0">
      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="size-2.5 rounded-sm bg-accent" />
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              検索結果
            </h2>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              // RESULTS
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {articles.length}記事
          </span>
        </div>
        <div className="topic-rule" />
      </div>
      <TopicCarousel articles={articles} />
    </section>
  )
}

function FilterSummary({
  resultCount,
  onClear,
}: {
  resultCount: number
  onClear: () => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
      <span className="font-mono text-xs text-muted-foreground">
        {resultCount}件を表示中
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
      >
        フィルタを解除
      </button>
    </div>
  )
}

function IndustryFilterPanel({
  selectedIndustries,
  resultCount,
  onToggle,
  onClear,
}: {
  selectedIndustries: IndustryTag[]
  resultCount: number
  onToggle: (tag: IndustryTag) => void
  onClear: () => void
}) {
  return (
    <section className="mb-6 rounded-md border border-border bg-card px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-primary">
              INDUSTRY
            </span>
            <span className="text-xs text-muted-foreground">
              業界で絞り込み
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map((tag) => (
              <IndustryChip
                key={tag}
                active={selectedIndustries.includes(tag)}
                onClick={() => onToggle(tag)}
                label={INDUSTRY_LABELS[tag]}
              />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-3 lg:min-w-44 lg:justify-end lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <span className="font-mono text-xs font-semibold text-foreground">
            {resultCount}件を表示中
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
          >
            フィルタを解除
          </button>
        </div>
      </div>
    </section>
  )
}

function IndustryChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
