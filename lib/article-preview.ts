import type { NewsArticle } from "@/lib/news-data"

const PREVIEW_SUMMARY_LENGTH = 160

/**
 * Removes member-only article fields before an article is serialized to an
 * unauthenticated or expired browser.
 */
export function toArticlePreview(article: NewsArticle): NewsArticle {
  return {
    ...article,
    summary: article.summary.slice(0, PREVIEW_SUMMARY_LENGTH),
    implications: [],
    sourceUrl: undefined,
    backgroundContext: undefined,
    japanBusinessImpact: undefined,
    keywords: undefined,
    marketSnapshot: undefined,
    provenance: undefined,
    sources: undefined,
    qualityCheck: undefined,
  }
}
