import { buildNewsSitemap } from "@/lib/feeds"
import { listPublishedArticles } from "@/lib/supabase/article-repository"

export const revalidate = 900

/**
 * Googleニュース用サイトマップ(直近48時間の記事のみ)。通常の sitemap.xml とは別に
 * robots.txt から参照する。新着記事を早くクロールさせるのが目的。
 */
export async function GET() {
  const articles = await listPublishedArticles()
  return new Response(buildNewsSitemap(articles), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
