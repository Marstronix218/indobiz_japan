"use client"

import Link from "next/link"
import { BarChart3, ChevronRight } from "lucide-react"
import { usePublicArticles } from "@/lib/article-store"
import { mergeRankedArticles } from "@/lib/home-selection"
import {
  articleDisplayDate,
  computePopularityScore,
  formatArticleShortDate,
} from "@/lib/news-data"
import { addJapanesePhraseBreaks } from "@/lib/japanese-line-breaks"

export function AccessRankingWidget({ rankedIds }: { rankedIds: string[] }) {
  const articles = usePublicArticles()
  const ranked = mergeRankedArticles(rankedIds, articles, 5, computePopularityScore)
  if (ranked.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-3.5 text-accent" />
          <h3 className="font-serif text-[13px] font-bold">アクセスランキング</h3>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
          24時間
        </span>
      </div>
      <ul className="space-y-3">
        {ranked.map((article, index) => (
          <li key={article.id} className="flex gap-2.5">
            <span
              className={
                "w-6 shrink-0 font-serif text-xl font-black leading-none " +
                (index < 3 ? "text-accent" : "text-border")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/article/${article.id}`}
                className="text-auto-phrase line-clamp-2 text-xs font-semibold leading-relaxed hover:text-accent"
              >
                {addJapanesePhraseBreaks(article.title)}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {formatArticleShortDate(articleDisplayDate(article))}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/?view=latest"
        className="mt-3 flex items-center justify-end gap-0.5 text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}
