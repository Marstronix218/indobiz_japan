import type { Metadata } from "next"
import { permanentRedirect } from "next/navigation"

import { ArticleStoreProvider } from "@/components/article-store-provider"
import { ArticleView } from "@/components/article-view"
import { DataUnavailable } from "@/components/data-unavailable"
import { JsonLd } from "@/components/json-ld"
import { articleSlug } from "@/lib/article-slug"
import { toArticlePreview } from "@/lib/article-preview"
import { articleDisplayDate, type NewsArticle } from "@/lib/news-data"
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/structured-data"
import {
  getArticleById,
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

/** 記事の正規パス。スラッグが取れない記事は `/article/<id>` のまま。 */
function canonicalPath(article: NewsArticle): string {
  const slug = articleSlug(article)
  return slug ? `/article/${article.id}/${slug}` : `/article/${article.id}`
}

/**
 * リクエストされたURLが正規形でなければ301相当（308）で送り返す。
 * 旧UUIDのみのURL・古いスラッグ付きURLからの被リンクを生かすため、
 * 404にはせず必ずリダイレクトする。
 */
function redirectToCanonical(article: NewsArticle, requestedSlug?: string) {
  const canonical = canonicalPath(article)
  const current = requestedSlug
    ? `/article/${article.id}/${requestedSlug}`
    : `/article/${article.id}`
  if (current !== canonical) permanentRedirect(canonical)
}

export async function buildArticleMetadata(id: string): Promise<Metadata> {
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
  const path = canonicalPath(article)
  // 画面に出している日付・JSON-LDのdatePublishedと同じ値を使う。
  // 3つがずれるとGoogleが公開日を判断できない。
  const publishedTime = articleDisplayDate(article)

  return {
    title: `${article.title} | IndoBiz Japan`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: path,
      publishedTime,
      modifiedTime: publishedTime,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  }
}

/**
 * 記事ページ本体。`/article/[id]` と `/article/[id]/[slug]` の両方から使う。
 * `requestedSlug` は後者だけが渡す（前者は常にスラッグ付きURLへ送られる）。
 */
export async function ArticlePageView({
  id,
  requestedSlug,
}: {
  id: string
  requestedSlug?: string
}) {
  if (!hasSupabaseConfig()) {
    return <DataUnavailable showHomeLink />
  }

  const [article, rankedViewIds] = await Promise.all([
    getArticleById(id),
    getTopViewedArticleIds(24, 5),
  ])

  if (!article || article.workflowStatus !== "published") {
    return <DataUnavailable showHomeLink />
  }

  redirectToCanonical(article, requestedSlug)

  const structuredData = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd(article.category, article),
  ]

  // 本文を出すのはこの記事だけ。他の記事は関連記事・サイドバーのカードにしか
  // 使わないのでプレビューに削り、ページのHTMLを軽くする。
  const articles = await listPublishedArticles()
  const storeArticles = articles.map((item) =>
    item.id === article.id ? article : toArticlePreview(item),
  )
  // The feed is capped, so merge an older directly requested article back in.
  if (!storeArticles.some((item) => item.id === article.id)) {
    storeArticles.unshift(article)
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <ArticleStoreProvider initial={storeArticles}>
        <ArticleView id={id} rankedViewIds={rankedViewIds} />
      </ArticleStoreProvider>
    </>
  )
}
