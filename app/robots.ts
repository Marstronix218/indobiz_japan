import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site-config"

const DISALLOW = [
  "/admin/",
  "/api/",
  "/login",
  "/signup",
  "/profile",
  "/extend-code",
  "/contact/thanks",
]

/**
 * AI検索・AIアシスタントのクローラ。`*` でも許可されているが、LLMO(AI検索での
 * 引用)を狙う方針を明示するため個別に列挙する。UA別グループを作ると `*` の
 * ルールは継承されないので、同じ disallow を必ず付ける。
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`],
    host: SITE_URL,
  }
}
