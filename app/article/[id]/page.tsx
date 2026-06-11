import { cookies } from "next/headers"
import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { ArticleTeaser } from "@/components/article-teaser"
import { DataUnavailable } from "@/components/data-unavailable"
import { FREE_VIEW_COOKIE, parseViewedIds } from "@/lib/free-view"
import {
  getArticleById,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getSessionUser } from "@/lib/supabase/server-auth"

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

  if (!user) {
    const article = await getArticleById(id)
    if (!article || article.workflowStatus !== "published") {
      return <DataUnavailable showHomeLink />
    }
    // `proxy.ts` records each anonymous read in this cookie up to
    // FREE_ARTICLE_LIMIT. If this article isn't in the list, the visitor has
    // already used up their free reads — show the login teaser instead.
    const cookieStore = await cookies()
    const viewed = parseViewedIds(cookieStore.get(FREE_VIEW_COOKIE)?.value)
    if (!viewed.includes(id)) {
      return <ArticleTeaser article={article} atLimit />
    }
    // Within the free allowance: fall through to the full article view.
  }

  const articles = await listPublishedArticles()

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
      <ArticleView id={id} />
    </ArticleStoreProvider>
  )
}
