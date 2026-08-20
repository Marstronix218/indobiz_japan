import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import {
  ArticleTeaser,
  type ArticleTeaserReason,
} from "@/components/article-teaser"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getArticleById,
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { ensureUserBetaAccess } from "@/lib/supabase/beta-access"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { toArticlePreview } from "@/lib/article-preview"
import type { NewsArticle } from "@/lib/news-data"
import type { Metadata } from "next"

export const revalidate = 0

async function renderArticleTeaser(
  article: NewsArticle,
  rankedViewIds: string[],
  reason: ArticleTeaserReason,
) {
  const articles = await listPublishedArticles()
  const storeArticles = (
    articles.some((item) => item.id === article.id)
      ? articles
      : [article, ...articles]
  ).map(toArticlePreview)

  return (
    <ArticleStoreProvider initial={storeArticles}>
      <ArticleTeaser
        article={toArticlePreview(article)}
        rankedViewIds={rankedViewIds}
        reason={reason}
      />
    </ArticleStoreProvider>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (!hasSupabaseConfig()) {
    return {
      title: "記事を取得できません | IndoBiz Japan",
      robots: { index: false, follow: false },
    }
  }
  const article = await getArticleById(id)
  if (!article || article.workflowStatus !== "published") {
    return {
      title: "記事が見つかりません | IndoBiz Japan",
      robots: { index: false, follow: false },
    }
  }

  const description = article.summary.slice(0, 160)

  return {
    title: `${article.title} | IndoBiz Japan`,
    description,
    alternates: { canonical: `/article/${id}` },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `/article/${id}`,
      publishedTime: article.publishedAt,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
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

  const [user, article, rankedViewIds] = await Promise.all([
    getSessionUser(),
    getArticleById(id),
    getTopViewedArticleIds(24, 5),
  ])

  if (!article || article.workflowStatus !== "published") {
    return <DataUnavailable showHomeLink />
  }

  if (!user) {
    return renderArticleTeaser(article, rankedViewIds, "login_required")
  }

  const betaAccess = await ensureUserBetaAccess(user.id)
  if (!betaAccess) {
    return (
      <DataUnavailable
        title="ご利用期間を確認できません"
        description="現在アクセス状況を確認できません。しばらくしてから再度お試しください。"
        showHomeLink
      />
    )
  }

  if (!betaAccess.evaluation.hasFullAccess) {
    const reason: ArticleTeaserReason =
      betaAccess.evaluation.phase === "survey_required"
        ? "survey_required"
        : "expired"
    return renderArticleTeaser(article, rankedViewIds, reason)
  }

  const articles = await listPublishedArticles()
  // The feed is capped, so merge an older directly requested article back in.
  const storeArticles = articles.some((item) => item.id === id)
    ? articles
    : [article, ...articles]

  if (storeArticles.length === 0) {
    return <DataUnavailable showHomeLink />
  }

  return (
    <ArticleStoreProvider initial={storeArticles}>
      <ArticleView id={id} rankedViewIds={rankedViewIds} />
    </ArticleStoreProvider>
  )
}
