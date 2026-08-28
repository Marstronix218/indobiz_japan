import { articlePath } from "@/lib/article-slug"
import { resolveArticleAuthor } from "@/lib/authors"
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  articleDisplayDate,
  type Category,
  type NewsArticle,
} from "@/lib/news-data"
import { SITE_URL } from "@/lib/site-config"

/** JSON-LD 1件分。値の形はschema.org任せなので unknown で持つ。 */
export type JsonLdObject = Record<string, unknown>

const ORGANIZATION_ID = `${SITE_URL}/#organization`
const LOGO_URL = `${SITE_URL}/goindia.png`

/** Googleのheadline推奨上限。超えると構造化データ側で無視されることがある。 */
const HEADLINE_MAX = 110

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
 * 記事本文はログイン（LINE登録）の内側にあるので、`isAccessibleForFree: false`
 * と `hasPart` で「どこが未ログインでは読めない部分か」を明示する。これが無いと
 * クローラが見るHTML（ティーザー）と会員が見る本文の差がクローキング扱いされうる。
 * セレクタ `.article-gated-body` は ArticleView / ArticleTeaser 側と対になっている。
 */
export function buildArticleJsonLd(article: NewsArticle): JsonLdObject {
  const url = `${SITE_URL}${articlePath(article)}`
  // 画面表示・OGP(article:published_time)と同じ値を使う。
  // articlesテーブルに編集日時の列は無いので dateModified は同値。
  const published = toIso(articleDisplayDate(article)) ?? toIso(article.publishedAt)
  const author = resolveArticleAuthor(article)

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: truncate(article.title, HEADLINE_MAX),
    // meta descriptionと同じ長さに揃える（未ログインに配信する要約の量を増やさない）。
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
    isAccessibleForFree: false,
    hasPart: {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: ".article-gated-body",
    },
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
