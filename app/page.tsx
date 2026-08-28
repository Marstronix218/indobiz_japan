import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { toArticlePreview } from "@/lib/article-preview"
import { hasLineCampaignAccess } from "@/lib/line-campaign"
import { CATEGORY_OPTIONS, type Category } from "@/lib/news-data"
import { SITE_URL } from "@/lib/site-config"
import type { Metadata } from "next"

export const revalidate = 0

/**
 * 旧来の `/?category=<slug>` は独立URL `/category/<slug>` に正規化する。
 * 既にインデックスされているクエリ付きURLの評価を新URLへ寄せるため。
 * それ以外のクエリ（検索・タグ・view）はトップの重複なので `/` に集約する。
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const raw = params.category
  const category = Array.isArray(raw) ? raw[0] : raw
  const canonical = CATEGORY_OPTIONS.includes(category as Category)
    ? `/category/${category}`
    : "/"
  return { alternates: { canonical } }
}

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IndoBiz Japan",
  alternateName: ["Indo Biz Japan", "インドビズジャパン"],
  url: `${SITE_URL}/`,
}

export default async function HomePage() {
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

  return (
    <ArticleStoreProvider initial={visibleArticles}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <h1 className="sr-only">
        IndoBiz Japan（インドビズジャパン）— 日本企業向けインド市場情報
      </h1>
      <NewsList rankedViewIds={rankedViewIds} />
    </ArticleStoreProvider>
  )
}
