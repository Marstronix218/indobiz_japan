import type { NewsArticle, SourceProvenance } from "@/lib/news-data"

/** スラッグに含めるトークン数の上限。 */
const MAX_TOKENS = 8
/** スラッグ全体の文字数上限（URLの可読性のため）。 */
const MAX_LENGTH = 70

/**
 * 英語見出しから落とす機能語。意味を持たない語を削ると、URLに残るのは
 * 固有名詞・産業名・動きを表す語だけになる。
 */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for",
  "from", "has", "have", "how", "in", "into", "is", "it", "its", "of", "on",
  "or", "over", "s", "so", "that", "the", "their", "there", "they", "this",
  "to", "up", "was", "were", "what", "when", "which", "who", "why", "will",
  "with", "amid", "after", "before", "than", "then", "may", "can", "could",
  "would", "should", "not", "no", "new", "says", "said", "say", "get", "gets",
])

/**
 * 見出し末尾の媒体名（"… - Times of India" / "… | Mint"）を落とす。
 * 区切りの後ろが短い場合だけ媒体名とみなす。
 */
function stripPublisherSuffix(title: string): string {
  const match = title.match(/^(.*\S)\s+[-|–—]\s+([^\-|–—]{1,40})$/)
  return match ? match[1] : title
}

function toTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0)
}

/** 日本語見出しに混ざるラテン文字語（GST, EV, Tata など）だけを拾う。 */
function latinTokensFromJapanese(title: string): string[] {
  const matches = title.match(/[A-Za-z][A-Za-z0-9]*/g) ?? []
  return matches.map((token) => token.toLowerCase())
}

function primarySourceTitle(
  provenance: SourceProvenance | undefined,
  sources: SourceProvenance[] | undefined,
): string {
  const candidate = provenance?.originalTitle ?? sources?.[0]?.originalTitle
  return candidate?.trim() ?? ""
}

/**
 * 記事URL末尾に付けるスラッグを組み立てる。
 *
 * 記事本文は日本語だが、日本語見出しは漢字が中心でURLに載せられないので、
 * 元記事（英語）の見出しからキーワードを取る。単一ソースのクラスタは
 * パイプライン側で落とされるため、実運用の記事にはほぼ常にソースがある。
 * 取れない場合は空文字を返し、呼び出し側は `/article/<id>` のままにする。
 *
 * 同じ記事からは常に同じ値が出る純粋関数であること（URLの安定性）。
 */
export function buildArticleSlug(article: {
  title: string
  provenance?: SourceProvenance
  sources?: SourceProvenance[]
}): string {
  const sourceTitle = primarySourceTitle(article.provenance, article.sources)
  const candidates = [
    ...toTokens(stripPublisherSuffix(sourceTitle)),
    ...latinTokensFromJapanese(article.title ?? ""),
  ]

  const tokens: string[] = []
  let hasWord = false
  for (const token of candidates) {
    if (token.length < 2) continue
    if (STOP_WORDS.has(token)) continue
    if (tokens.includes(token)) continue
    // 数字だけの語（日本語ソースの「17日」など）は単独では意味を持たないので、
    // 語が1つも入っていないうちは採らない。
    const isNumeric = !/[a-z]/.test(token)
    if (isNumeric && !hasWord) continue
    if (!isNumeric && token.length >= 3) hasWord = true
    tokens.push(token)
    if (tokens.length >= MAX_TOKENS) break
  }

  // 意味のある語が1つも無い（日本語ソースの見出しなど）ならスラッグを付けない。
  if (!hasWord) return ""

  let slug = ""
  for (const token of tokens) {
    const next = slug ? `${slug}-${token}` : token
    if (next.length > MAX_LENGTH) break
    slug = next
  }
  return slug
}

/**
 * 記事オブジェクトのスラッグ。Supabaseから読んだ時点（`rowToArticle`）で
 * `slug` が確定しているので通常はそれを使い、シードデータなど未設定の
 * 場合だけその場で組み立てる。
 */
export function articleSlug(article: NewsArticle): string {
  return article.slug ?? buildArticleSlug(article)
}

/** 記事ページの正規パス。スラッグが取れない記事はUUIDのみのパスを返す。 */
export function articlePath(article: NewsArticle): string {
  const slug = articleSlug(article)
  return slug ? `/article/${article.id}/${slug}` : `/article/${article.id}`
}

/** ID+スラッグからパスを作る（記事オブジェクトを持たない箇所用）。 */
export function articlePathFor(id: string, slug: string): string {
  return slug ? `/article/${id}/${slug}` : `/article/${id}`
}
