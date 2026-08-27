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
import { SITE_URL } from "@/lib/site-config"
import type { Metadata } from "next"

export const revalidate = 0

export const metadata: Metadata = {
  alternates: { canonical: "/" },
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
