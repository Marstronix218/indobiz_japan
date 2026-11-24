import { buildRssFeed } from "@/lib/feeds"
import { listPublishedArticles } from "@/lib/supabase/article-repository"

export const revalidate = 1800

/** RSS 2.0。フィードリーダー・ニュースアグリゲータ・AI検索のクローラ向け。 */
export async function GET() {
  const articles = await listPublishedArticles()
  return new Response(buildRssFeed(articles), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
