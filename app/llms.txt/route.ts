import { listCities } from "@/lib/cities"
import { buildLlmsTxt } from "@/lib/feeds"
import { listPublishedArticles } from "@/lib/supabase/article-repository"

export const revalidate = 3600

/** https://llmstxt.org/ — AIアシスタント向けのサイト概要と主要URL。 */
export async function GET() {
  const articles = await listPublishedArticles()
  return new Response(buildLlmsTxt(articles, listCities()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
