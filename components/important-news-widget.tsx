"use client"

import Link from "next/link"
import { Newspaper } from "lucide-react"
import { usePublicArticles } from "@/lib/article-store"
import { selectImportantNews } from "@/lib/home-selection"
import {
  CATEGORY_LABELS,
  articleDisplayDate,
  computePopularityScore,
  formatArticleShortDate,
} from "@/lib/news-data"

export function ImportantNewsWidget() {
  const articles = usePublicArticles()
  const items = selectImportantNews(articles, Date.now(), 5, computePopularityScore)
  if (items.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <Newspaper className="size-4 text-primary" />
        <h3 className="font-serif text-sm font-bold">本日の重要ニュース</h3>
      </div>
      <ul className="space-y-3">
        {items.map((article) => (
          <li key={article.id} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold text-accent">
              {formatArticleShortDate(articleDisplayDate(article))}
            </span>
            <div className="min-w-0">
              <span className="mb-0.5 inline-block bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground">
                {CATEGORY_LABELS[article.category]}
              </span>
              <Link
                href={`/article/${article.id}`}
                className="line-clamp-2 text-[13px] font-semibold leading-snug hover:text-accent"
              >
                {article.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-3 block text-center text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る
      </Link>
    </div>
  )
}
