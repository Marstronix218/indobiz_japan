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
import {
  getBetaAccessStatus,
  listBetaPreviewArticleIds,
  recordBetaAccessEvent,
  toPublicTeaserArticle,
} from "@/lib/beta-access"
import { createBetaReadToken } from "@/lib/beta-read-token"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

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
    description: article.summary.slice(0, 160),
  }
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const query = await searchParams

  if (!hasSupabaseConfig()) {
    return <DataUnavailable showHomeLink />
  }

  const [user, article] = await Promise.all([getSessionUser(), getArticleById(id)])
  if (!article || article.workflowStatus !== "published") {
    return <DataUnavailable showHomeLink />
  }

  if (!user) {
    const [articles, rankedViewIds] = await Promise.all([
      listPublishedArticles(),
      getTopViewedArticleIds(24, 5),
    ])
    const storeArticles = (
      articles.some((item) => item.id === article.id)
        ? articles
        : [article, ...articles]
    ).map(toPublicTeaserArticle)
    return (
      <ArticleStoreProvider initial={storeArticles}>
        <ArticleTeaser
          article={toPublicTeaserArticle(article)}
          rankedViewIds={rankedViewIds}
        />
      </ArticleStoreProvider>
    )
  }

  if (!isBetaAccessEnabled()) {
    const [articles, rankedViewIds] = await Promise.all([
      listPublishedArticles(),
      getTopViewedArticleIds(24, 5),
    ])
    const storeArticles = articles.some((item) => item.id === id)
      ? articles
      : [article, ...articles]
    return (
      <ArticleStoreProvider initial={storeArticles}>
        <ArticleView id={id} rankedViewIds={rankedViewIds} />
      </ArticleStoreProvider>
    )
  }

  const [articles, rankedViewIds, previewIds, access] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
    listBetaPreviewArticleIds(),
    getBetaAccessStatus(user.id),
  ])

  let storeArticles = articles
  if (!articles.some((item) => item.id === id)) {
    storeArticles = [article, ...articles]
  }

  if (storeArticles.length === 0) {
    return <DataUnavailable showHomeLink />
  }

  const isPreviewArticle = previewIds.includes(id)
  if (!access.hasFullAccess && !isPreviewArticle) {
    await recordBetaAccessEvent(user.id, "gate_view", article.id)
    const teaserArticles = storeArticles.map(toPublicTeaserArticle)
    const previewArticles = teaserArticles.filter((item) => previewIds.includes(item.id))
    return (
      <ArticleStoreProvider initial={teaserArticles}>
        <ArticleTeaser
          article={toPublicTeaserArticle(article)}
          rankedViewIds={rankedViewIds}
          betaGate={{
            readsCount: access.readsCount,
            requiredReads: access.requiredReads,
            surveyEligible: access.surveyEligible,
            previewArticles,
            lineFriendRequired: query.line_friend_required === "1",
            lineError: query.auth_error === "line_friend_check",
          }}
        />
      </ArticleStoreProvider>
    )
  }

  const safeStoreArticles = access.hasFullAccess
    ? storeArticles
    : storeArticles.map((item) =>
        item.id === id ? item : toPublicTeaserArticle(item),
      )

  return (
    <ArticleStoreProvider initial={safeStoreArticles}>
      <ArticleView
        id={id}
        rankedViewIds={rankedViewIds}
        betaProgress={
          access.hasFullAccess
            ? undefined
            : {
                initialReadsCount: access.readsCount,
                requiredReads: access.requiredReads,
                readToken: createBetaReadToken(user.id, id),
              }
        }
      />
    </ArticleStoreProvider>
  )
}
