"use client"

import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { usePublicArticles } from "@/lib/article-store"
import { mergeRankedArticles } from "@/lib/home-selection"
import {
  articleDisplayDate,
  computePopularityScore,
  formatArticleShortDate,
} from "@/lib/news-data"

export function AccessRankingWidget({ rankedIds }: { rankedIds: string[] }) {
  const articles = usePublicArticles()
  const ranked = mergeRankedArticles(rankedIds, articles, 5, computePopularityScore)
  if (ranked.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-accent" />
          <h3 className="font-serif text-sm font-bold">アクセスランキング</h3>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
          24時間
        </span>
      </div>
      <ul className="space-y-3.5">
        {ranked.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <span
              className={
                "w-7 shrink-0 font-serif text-2xl font-black leading-none " +
                (index < 3 ? "text-accent" : "text-border")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/article/${article.id}`}
                className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
              >
                {article.title}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {formatArticleShortDate(articleDisplayDate(article))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
