"use client"

import {
  ArticleStoreInitialContext,
  useHydrateArticles,
} from "@/lib/article-store"
import type { NewsArticle } from "@/lib/news-data"

export function ArticleStoreProvider({
  initial,
  children,
}: {
  initial: NewsArticle[]
  children: React.ReactNode
}) {
  useHydrateArticles(initial)

  return (
    <ArticleStoreInitialContext.Provider value={initial}>
      {children}
    </ArticleStoreInitialContext.Provider>
  )
}
