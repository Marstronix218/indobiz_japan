import type { MetadataRoute } from "next"

import { articlePath } from "@/lib/article-slug"
import { listCities } from "@/lib/cities"
import { CATEGORY_OPTIONS } from "@/lib/news-data"
import { SITE_URL } from "@/lib/site-config"
import { listPublishedArticles } from "@/lib/supabase/article-repository"

export const revalidate = 3600

const staticPages: Array<{
  path: string
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly"
  priority: number
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/city", changeFrequency: "weekly", priority: 0.8 },
  { path: "/company", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/legal/tokushoho", changeFrequency: "yearly", priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, cities] = await Promise.all([
    listPublishedArticles(),
    Promise.resolve(listCities()),
  ])

  return [
    ...staticPages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...CATEGORY_OPTIONS.map((category) => ({
      url: `${SITE_URL}/category/${category}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...cities.map((city) => ({
      url: `${SITE_URL}/city/${city.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}${articlePath(article)}`,
      lastModified: article.createdAt ?? article.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    })),
  ]
}
