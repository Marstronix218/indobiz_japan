import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import { JsonLd } from "@/components/json-ld"
import { NewsList } from "@/components/news-list"
import { toArticlePreview } from "@/lib/article-preview"
import { hasLineCampaignAccess } from "@/lib/line-campaign"
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  type Category,
} from "@/lib/news-data"
import {
  buildBreadcrumbJsonLd,
  buildCategoryJsonLd,
} from "@/lib/structured-data"
import {
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const revalidate = 0

function toCategory(slug: string): Category | null {
  return CATEGORY_OPTIONS.includes(slug as Category) ? (slug as Category) : null
}

function categoryDescription(category: Category): string {
  return `${CATEGORY_DESCRIPTIONS[category]}。IndoBiz Japanが日本企業向けにインド市場の${CATEGORY_LABELS[category]}ニュースを日本語で毎日お届けします。`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = toCategory(slug)
  if (!category) {
    return {
      title: "カテゴリが見つかりません | IndoBiz Japan",
      robots: { index: false, follow: false },
    }
  }

  const title = `インドの${CATEGORY_LABELS[category]}ニュース | IndoBiz Japan`
  const description = categoryDescription(category)

  return {
    title,
    description,
    alternates: { canonical: `/category/${category}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/category/${category}`,
    },
    twitter: { card: "summary", title, description },
  }
}

/**
 * カテゴリ別の一覧ページ。`/?category=<slug>` と同じ絞り込みを、
 * 検索エンジンが評価できる独立URLとして出す。
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = toCategory(slug)
  if (!category) notFound()

  if (!hasSupabaseConfig()) {
    return <DataUnavailable />
  }

  const user = await getSessionUser()
  const [articles, rankedViewIds] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
  ])
  if (articles.length === 0) {
    return <DataUnavailable />
  }

  const visibleArticles = hasLineCampaignAccess(user)
    ? articles
    : articles.map(toArticlePreview)
  const categoryArticles = articles.filter(
    (article) => article.category === category,
  )

  return (
    <ArticleStoreProvider initial={visibleArticles}>
      <JsonLd
        data={[
          buildCategoryJsonLd(category, categoryArticles),
          buildBreadcrumbJsonLd(category),
        ]}
      />
      <h1 className="sr-only">
        インドの{CATEGORY_LABELS[category]}ニュース — IndoBiz Japan
      </h1>
      <NewsList rankedViewIds={rankedViewIds} lockedCategory={category} />
    </ArticleStoreProvider>
  )
}
