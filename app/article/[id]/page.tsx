import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { ArticleTeaser } from "@/components/article-teaser"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getArticleById,
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getSessionUser } from "@/lib/supabase/server-auth"
import type { NewsArticle } from "@/lib/news-data"

// Store payload for the logged-out teaser page. The sidebar widgets and
// related-article cards only need title/category/dates/image, so strip the
// gated content (full summary, 示唆, 背景/影響, keywords, sources) before it
// gets serialized into the RSC stream for an unauthenticated visitor.
function toTeaserStoreArticle(article: NewsArticle): NewsArticle {
  return {
    ...article,
    summary: article.summary.slice(0, 160),
    implications: [],
    backgroundContext: undefined,
    japanBusinessImpact: undefined,
    keywords: undefined,
    provenance: undefined,
    sources: undefined,
    qualityCheck: undefined,
  }
}

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!hasSupabaseConfig()) {
    return { title: "記事を取得できません | IndoBiz Japan" }
  }
  const article = await getArticleById(id)
  if (!article) return { title: "記事が見つかりません | IndoBiz Japan" }

  return {
    title: `${article.title} | IndoBiz Japan`,
    description: article.summary,
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!hasSupabaseConfig()) {
    return <DataUnavailable showHomeLink />
  }

  const user = await getSessionUser()

  // No free-read allowance: unauthenticated visitors always get the teaser.
  if (!user) {
    const article = await getArticleById(id)
    if (!article || article.workflowStatus !== "published") {
      return <DataUnavailable showHomeLink />
    }
    // Hydrate the article store so the teaser can render the shared
    // sidebar + related articles (both public info: titles/images only).
    const [articles, rankedViewIds] = await Promise.all([
      listPublishedArticles(),
      getTopViewedArticleIds(24, 5),
    ])
    const storeArticles = (
      articles.some((item) => item.id === article.id)
        ? articles
        : [article, ...articles]
    ).map(toTeaserStoreArticle)
    return (
      <ArticleStoreProvider initial={storeArticles}>
        <ArticleTeaser
          article={toTeaserStoreArticle(article)}
          rankedViewIds={rankedViewIds}
        />
      </ArticleStoreProvider>
    )
  }

  const [articles, rankedViewIds] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
  ])

  // `listPublishedArticles()` only returns the newest 100 published articles,
  // so any older published article (e.g. once the site has >100 articles)
  // would be missing from the store and `ArticleView` would render
  // "記事が見つかりません". Fetch the requested article directly and merge it
  // in if the feed list doesn't already contain it.
  let storeArticles = articles
  if (!articles.some((item) => item.id === id)) {
    const article = await getArticleById(id)
    if (!article || article.workflowStatus !== "published") {
      return <DataUnavailable showHomeLink />
    }
    storeArticles = [article, ...articles]
  }

  if (storeArticles.length === 0) {
    return <DataUnavailable showHomeLink />
  }

  return (
    <ArticleStoreProvider initial={storeArticles}>
      <ArticleView id={id} rankedViewIds={rankedViewIds} />
    </ArticleStoreProvider>
  )
}
