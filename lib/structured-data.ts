import { articlePath } from "@/lib/article-slug"
import { resolveArticleAuthor } from "@/lib/authors"
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  articleDisplayDate,
  getAllSources,
  type Category,
  type NewsArticle,
} from "@/lib/news-data"
import type { City } from "@/lib/cities/types"
import { SITE_URL } from "@/lib/site-config"

/** JSON-LD 1件分。値の形はschema.org任せなので unknown で持つ。 */
export type JsonLdObject = Record<string, unknown>

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const LOGO_URL = `${SITE_URL}/goindia.png`

/** Googleのheadline推奨上限。超えると構造化データ側で無視されることがある。 */
const HEADLINE_MAX = 110

const WEBSITE_ID = `${SITE_URL}/#website`

const SITE_DESCRIPTION =
  "IndoBiz Japan（インドビズジャパン）は、日本企業向けにインドの経済・規制・社会・市況ニュースを日本語で解説するニュースメディアです。"

const publisher: JsonLdObject = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "IndoBiz Japan",
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 1024,
    height: 1024,
  },
}

/**
 * サイト全体の Organization(NewsMediaOrganization) + WebSite。トップページに出す。
 * 運営会社は /company と一致させること。AI検索がサイトの素性(誰が・何を)を
 * 判断する材料になるので、description は具体的に書く。
 */
export function buildSiteJsonLd(): JsonLdObject[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "NewsMediaOrganization",
      "@id": ORGANIZATION_ID,
      name: "IndoBiz Japan",
      alternateName: ["Indo Biz Japan", "インドビズジャパン"],
      url: `${SITE_URL}/`,
      logo: publisher.logo,
      description: SITE_DESCRIPTION,
      areaServed: { "@type": "Country", name: "Japan" },
      knowsAbout: ["インド経済", "インド市場", "インド進出", "インドの規制・政策", "日印ビジネス"],
      parentOrganization: {
        "@type": "Organization",
        name: "グローバルランチャーズ株式会社",
        url: "https://global.launchers-g.com",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: "IndoBiz Japan",
      alternateName: ["Indo Biz Japan", "インドビズジャパン"],
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: "ja",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ]
}

/**
 * ISO 8601に正規化する。DBのtimestamptzは既にISOだが、シードデータや
 * 手入力の値が混ざっても壊れないように通す。パースできなければ undefined。
 */
function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined
  const time = Date.parse(value)
  return Number.isNaN(time) ? undefined : new Date(time).toISOString()
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

/**
 * 記事ページの NewsArticle 構造化データ。
 *
 * 記事は全文を無料公開しているので `isAccessibleForFree: true`。
 * 本文をログインの内側に戻す場合は false にし、`hasPart` の cssSelector で
 * 未ログインでは読めない範囲を示すこと（無いとクローキング扱いされうる）。
 */
export function buildArticleJsonLd(article: NewsArticle): JsonLdObject {
  const url = `${SITE_URL}${articlePath(article)}`
  // 画面表示・OGP(article:published_time)と同じ値を使う。
  // articlesテーブルに編集日時の列は無いので dateModified は同値。
  const published = toIso(articleDisplayDate(article)) ?? toIso(article.publishedAt)
  const author = resolveArticleAuthor(article)
  // 出典(元記事)を isBasedOn で明示する。AI検索が一次情報を辿れるようにし、
  // 「複数ソースを再構成した記事」であることを機械可読にする。
  const sources = getAllSources(article)
    .map((source) => source.canonicalUrl || source.originalUrl)
    .filter((value): value is string => Boolean(value && /^https?:\/\//.test(value)))
  const basedOn = sources.length > 0 ? sources : article.sourceUrl ? [article.sourceUrl] : []
  // 記事内のキーワード解説を DefinedTerm として出す(用語の定義をAIが引用しやすい)。
  const definedTerms = (article.keywords ?? []).map((keyword) => ({
    "@type": "DefinedTerm",
    name: keyword.term,
    ...(keyword.fullName ? { alternateName: keyword.fullName } : {}),
    description: keyword.definition,
  }))
  const keywords = [
    CATEGORY_LABELS[article.category],
    ...article.industryTags.map((tag) => INDUSTRY_LABELS[tag]).filter(Boolean),
    ...(article.keywords ?? []).map((keyword) => keyword.term),
    "インド",
  ]

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: truncate(article.title, HEADLINE_MAX),
    // meta descriptionと同じ長さに揃える。
    description: truncate(article.summary, 160),
    datePublished: published,
    dateModified: published,
    inLanguage: "ja",
    articleSection: CATEGORY_LABELS[article.category],
    author: author
      ? { "@type": "Person", name: author.name, jobTitle: author.title }
      : { "@type": "Organization", "@id": ORGANIZATION_ID, name: "IndoBiz Japan" },
    publisher,
    image: [article.imageUrl ?? LOGO_URL],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    isAccessibleForFree: true,
    keywords: Array.from(new Set(keywords)).join(", "),
    ...(article.implications.length > 0
      ? { abstract: article.implications.join(" ") }
      : {}),
    ...(definedTerms.length > 0 ? { mentions: definedTerms } : {}),
    ...(basedOn.length > 0 ? { isBasedOn: basedOn } : {}),
    isPartOf: { "@id": WEBSITE_ID },
  }
}

/** トップ > カテゴリ > 記事 のパンくず。カテゴリページでは記事分を省く。 */
export function buildBreadcrumbJsonLd(
  category: Category,
  article?: NewsArticle,
): JsonLdObject {
  const items: JsonLdObject[] = [
    { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: CATEGORY_LABELS[category],
      item: `${SITE_URL}/category/${category}`,
    },
  ]
  if (article) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: article.title,
      item: `${SITE_URL}${articlePath(article)}`,
    })
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}

/** カテゴリ一覧ページの CollectionPage + 掲載記事の ItemList。 */
export function buildCategoryJsonLd(
  category: Category,
  articles: NewsArticle[],
): JsonLdObject {
  const url = `${SITE_URL}/category/${category}`
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `${CATEGORY_LABELS[category]}ニュース | IndoBiz Japan`,
    description: CATEGORY_DESCRIPTIONS[category],
    inLanguage: "ja",
    isPartOf: { "@type": "WebSite", name: "IndoBiz Japan", url: `${SITE_URL}/` },
    publisher,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: `${SITE_URL}${articlePath(article)}`,
      })),
    },
  }
}

/** 都市ページの City + BreadcrumbList。値はすべて lib/cities の静的データ由来。 */
export function buildCityJsonLd(city: City): JsonLdObject[] {
  const url = `${SITE_URL}/city/${city.slug}`
  return [
    {
      "@context": "https://schema.org",
      "@type": "City",
      "@id": `${url}#city`,
      name: city.jp,
      alternateName: city.name,
      description: city.note,
      url,
      ...(city.imageUrl ? { image: city.imageUrl } : {}),
      geo: { "@type": "GeoCoordinates", latitude: city.lat, longitude: city.lon },
      containedInPlace: { "@type": "Country", name: "インド", alternateName: "India" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "都市データ", item: `${SITE_URL}/city` },
        { "@type": "ListItem", position: 3, name: city.jp, item: url },
      ],
    },
  ]
}
