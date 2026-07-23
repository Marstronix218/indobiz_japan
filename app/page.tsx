import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { ensureUserBetaAccess } from "@/lib/supabase/beta-access"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { toArticlePreview } from "@/lib/article-preview"

export const revalidate = 0

export default async function HomePage() {
  if (!hasSupabaseConfig()) {
    return <DataUnavailable />
  }

  const user = await getSessionUser()
  const [articles, rankedViewIds, betaAccess] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
    user ? ensureUserBetaAccess(user.id) : Promise.resolve(null),
  ])
  if (articles.length === 0) {
    return <DataUnavailable />
  }

  const visibleArticles = betaAccess?.evaluation.hasFullAccess
    ? articles
    : articles.map(toArticlePreview)

  return (
    <ArticleStoreProvider initial={visibleArticles}>
      <NewsList rankedViewIds={rankedViewIds} />
    </ArticleStoreProvider>
  )
}
