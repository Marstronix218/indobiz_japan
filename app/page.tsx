import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { listBetaPreviewArticleIds, toPublicTeaserArticle } from "@/lib/beta-access"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

export const revalidate = 0

export default async function HomePage() {
  if (!hasSupabaseConfig()) {
    return <DataUnavailable />
  }

  const betaEnabled = isBetaAccessEnabled()
  const [articles, rankedViewIds, betaPreviewIds] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
    betaEnabled ? listBetaPreviewArticleIds() : Promise.resolve([]),
  ])
  if (articles.length === 0) {
    return <DataUnavailable />
  }

  return (
    <ArticleStoreProvider initial={articles.map(toPublicTeaserArticle)}>
      <NewsList rankedViewIds={rankedViewIds} betaPreviewIds={betaPreviewIds} />
    </ArticleStoreProvider>
  )
}
