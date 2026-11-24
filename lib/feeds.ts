import { articlePath } from "@/lib/article-slug"
import { formatDate } from "@/lib/date-format"
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  articleDisplayDate,
  type NewsArticle,
} from "@/lib/news-data"
import type { City } from "@/lib/cities/types"
import { SITE_URL } from "@/lib/site-config"

/**
 * 機械向けフィード(RSS / Googleニュース用サイトマップ / llms.txt)の生成。
 * ルートハンドラから記事配列を渡して文字列を受け取るだけの純粋関数にしている。
 */

const SITE_NAME = "IndoBiz Japan"
const SITE_TAGLINE =
  "日本企業向けに、インドの経済・規制・社会・市況ニュースを日本語で解説するニュースメディア"

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // XML 1.0で使えない制御文字を落とす(LLM出力に紛れることがある)。
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
}

function absoluteUrl(article: NewsArticle): string {
  return `${SITE_URL}${articlePath(article)}`
}

function parseTime(value: string): number {
  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

function oneLine(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`
}

/** RSS 2.0。新しい順に最大 limit 件。 */
export function buildRssFeed(articles: NewsArticle[], limit = 50): string {
  const items = articles
    .slice()
    .sort((a, b) => parseTime(articleDisplayDate(b)) - parseTime(articleDisplayDate(a)))
    .slice(0, limit)

  const lastBuild = items[0]
    ? new Date(parseTime(articleDisplayDate(items[0]))).toUTCString()
    : new Date().toUTCString()

  const itemXml = items
    .map((article) => {
      const url = absoluteUrl(article)
      const pubDate = new Date(parseTime(articleDisplayDate(article))).toUTCString()
      const image = article.imageUrl
        ? `\n      <enclosure url="${escapeXml(article.imageUrl)}" type="${
            /\.png(\?|$)/i.test(article.imageUrl) ? "image/png" : "image/jpeg"
          }" length="0" />`
        : ""
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${escapeXml(article.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(CATEGORY_LABELS[article.category])}</category>
      <description>${escapeXml(oneLine(article.summary, 300))}</description>${image}
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>ja</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <image>
      <url>${SITE_URL}/goindia.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}/</link>
    </image>
${itemXml}
  </channel>
</rss>
`
}

/** Googleニュースのサイトマップに載せられるのは公開から48時間以内の記事だけ。 */
const NEWS_SITEMAP_WINDOW_MS = 48 * 60 * 60 * 1000
/** Googleニュースのサイトマップ1ファイルあたりの上限。 */
const NEWS_SITEMAP_MAX = 1000

export function buildNewsSitemap(articles: NewsArticle[], now = Date.now()): string {
  const recent = articles
    .filter((article) => {
      const time = parseTime(articleDisplayDate(article))
      return time > 0 && now - time <= NEWS_SITEMAP_WINDOW_MS
    })
    .slice(0, NEWS_SITEMAP_MAX)

  const urls = recent
    .map((article) => {
      const published = new Date(parseTime(articleDisplayDate(article))).toISOString()
      return `  <url>
    <loc>${escapeXml(absoluteUrl(article))}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>ja</news:language>
      </news:publication>
      <news:publication_date>${published}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`
}

/**
 * llms.txt (https://llmstxt.org/)。AIアシスタント・AI検索がサイトの素性と
 * 主要ページを把握するための Markdown。最新記事は各カテゴリ数件ずつ載せる。
 */
export function buildLlmsTxt(
  articles: NewsArticle[],
  cities: City[],
  perCategory = 10,
): string {
  const lines: string[] = []
  lines.push(`# ${SITE_NAME}（インドビズジャパン）`)
  lines.push("")
  lines.push(`> ${SITE_TAGLINE}です。インド市場への進出・取引・採用を検討する日本企業の意思決定に役立つ情報を、全記事無料で公開しています。`)
  lines.push("")
  lines.push("- 言語: 日本語")
  lines.push("- 対象読者: インド市場に関心を持つ日本企業の経営者・事業開発・海外事業担当者")
  lines.push("- 編集方針: 複数の海外・国内報道を出典として日本語で再構成し、各記事に「本記事のポイント」「ニュースの背景」「日本企業への影響」「キーワード解説」と出典リンクを付けています")
  lines.push("- 運営: グローバルランチャーズ株式会社")
  lines.push(`- RSS: ${SITE_URL}/feed.xml`)
  lines.push(`- サイトマップ: ${SITE_URL}/sitemap.xml`)
  lines.push("")

  lines.push("## カテゴリ")
  lines.push("")
  for (const category of CATEGORY_OPTIONS) {
    lines.push(
      `- [${CATEGORY_LABELS[category]}](${SITE_URL}/category/${category}): ${CATEGORY_DESCRIPTIONS[category]}`,
    )
  }
  lines.push("")

  const sorted = articles
    .slice()
    .sort((a, b) => parseTime(articleDisplayDate(b)) - parseTime(articleDisplayDate(a)))
  for (const category of CATEGORY_OPTIONS) {
    const inCategory = sorted.filter((article) => article.category === category).slice(0, perCategory)
    if (inCategory.length === 0) continue
    lines.push(`## 最新記事: ${CATEGORY_LABELS[category]}`)
    lines.push("")
    for (const article of inCategory) {
      const date = formatDate(articleDisplayDate(article))
      lines.push(`- [${oneLine(article.title, 120)}](${absoluteUrl(article)}) (${date}): ${oneLine(article.summary, 140)}`)
    }
    lines.push("")
  }

  if (cities.length > 0) {
    lines.push("## インド主要都市データ")
    lines.push("")
    for (const city of cities) {
      lines.push(`- [${city.jp}（${city.name}）](${SITE_URL}/city/${city.slug}): ${oneLine(city.note, 120)}`)
    }
    lines.push("")
  }

  lines.push("## Optional")
  lines.push("")
  lines.push(`- [運営会社](${SITE_URL}/company)`)
  lines.push(`- [利用規約・プライバシーポリシー](${SITE_URL}/terms)`)
  lines.push(`- [お問い合わせ](${SITE_URL}/contact)`)
  lines.push("")

  return lines.join("\n")
}
