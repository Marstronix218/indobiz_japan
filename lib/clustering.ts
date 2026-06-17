import type { RawSourceArticle } from "@/lib/automation"

const STOPWORDS = new Set<string>([
  "the", "a", "an", "and", "or", "but", "nor", "so", "yet", "for",
  "of", "to", "in", "on", "at", "by", "from", "with", "about", "as",
  "into", "like", "through", "after", "over", "between", "out", "against",
  "during", "without", "before", "under", "around", "among", "off",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "has", "have", "had", "having", "do", "does", "did", "done",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "this", "that", "these", "those", "there", "here", "their", "they", "them",
  "its", "it", "his", "her", "our", "your", "my", "we", "you", "he", "she",
  "who", "what", "when", "where", "why", "how", "which", "whose",
  "said", "says", "told", "according", "also", "more", "than", "such", "per",
  "one", "two", "three", "new", "last", "first", "next", "year", "years",
  "day", "days", "week", "month", "time", "since", "now", "already", "still",
  "all", "any", "some", "each", "every", "few", "many", "most", "other",
  "if", "because", "while", "though", "although", "unless", "until",
  "not", "no", "only", "just", "very", "too", "even", "back", "up", "down",
  "news", "report", "reports", "reuters", "pib", "google", "india", "indian",
  "business", "economy", "economic", "market", "markets", "company", "companies",
  "industry", "industries", "sector", "sectors", "growth", "global", "trade",
  "investment", "investments", "investor", "investors", "deal", "billion", "million",
  "share", "shares", "stock", "stocks", "price", "prices", "high", "low",
  "government", "policy", "minister", "ministry", "official", "officials",
  "country", "world", "international", "national", "local", "state", "states",
  "ltd", "inc", "corp", "group", "holdings", "limited",
  "rupee", "rupees",
  "は", "が", "の", "を", "に", "で", "と", "も", "から", "まで",
  "これ", "その", "あの", "この", "それ", "あれ", "ここ", "そこ", "どこ",
  "です", "ます", "した", "する", "ある", "いる", "なる", "れる", "られる",
  "こと", "もの", "ため", "よう", "という", "について", "として", "による",
  "など", "および", "または", "および", "一方", "また", "さらに",
])

const MIN_TOKEN_LENGTH = 3

const CJK_RUN_REGEX = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]+/gu
const CJK_CHAR_REGEX = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]/

export function extractKeywords(title: string, body: string, n: number): string[] {
  const weightedText = `${title} ${title} ${title} ${body ?? ""}`

  const rawTokens = weightedText
    .split(/[\s\n\r\t]+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)

  const scores = new Map<string, number>()

  for (const raw of rawTokens) {
    if (CJK_CHAR_REGEX.test(raw)) {
      for (const latinRun of raw.match(/[A-Za-z0-9]+/g) ?? []) {
        if (latinRun.length < MIN_TOKEN_LENGTH) continue
        const lower = latinRun.toLowerCase()
        if (STOPWORDS.has(lower)) continue
        const isProperNoun = /^[A-Z]/.test(latinRun)
        const boost = isProperNoun ? 2 : 0
        scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
      }
      continue
    }
    if (raw.length < MIN_TOKEN_LENGTH) continue
    const lower = raw.toLowerCase()
    if (STOPWORDS.has(lower)) continue

    const isProperNoun = /^[A-Z]/.test(raw)
    const boost = isProperNoun ? 2 : 0
    scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
  }

  for (const run of weightedText.match(CJK_RUN_REGEX) ?? []) {
    if (run.length < 2) continue
    for (let i = 0; i < run.length - 1; i++) {
      const bigram = run.slice(i, i + 2)
      if (STOPWORDS.has(bigram)) continue
      scores.set(bigram, (scores.get(bigram) ?? 0) + 1)
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([token]) => token)
}

export interface ClusterOptions {
  minSharedKeywords: number
  windowHours: number
  keywordsPerArticle: number
}

function parsePublishedAt(value: string): number {
  const ts = Date.parse(value)
  if (!Number.isNaN(ts)) return ts
  const dateOnly = Date.parse(`${value}T00:00:00Z`)
  return Number.isNaN(dateOnly) ? 0 : dateOnly
}

export function clusterArticles(
  raws: RawSourceArticle[],
  opts: ClusterOptions,
): RawSourceArticle[][] {
  if (raws.length === 0) return []

  const { minSharedKeywords, windowHours, keywordsPerArticle } = opts
  const windowMs = windowHours * 60 * 60 * 1000
  const n = raws.length

  const indexed = raws.map((article) => ({
    keywords: new Set(
      extractKeywords(article.title, article.bodyText ?? "", keywordsPerArticle),
    ),
    publishedMs: parsePublishedAt(article.publishedAt),
  }))

  // Pairwise eligibility (time window + shared-keyword threshold) and the full
  // shared-keyword count (needed as the complete-linkage strength / tie-break).
  const eligible: boolean[][] = Array.from({ length: n }, () =>
    new Array<boolean>(n).fill(false),
  )
  const sharedCount: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const timeOk =
        Math.abs(indexed[i].publishedMs - indexed[j].publishedMs) <= windowMs
      let shared = 0
      if (timeOk) {
        for (const kw of indexed[i].keywords) {
          if (indexed[j].keywords.has(kw)) shared++
        }
      }
      eligible[i][j] = eligible[j][i] = timeOk && shared >= minSharedKeywords
      sharedCount[i][j] = sharedCount[j][i] = shared
    }
  }

  // Greedy complete-linkage agglomeration. Each cluster is a clique in which
  // every member pair is eligible. Two clusters merge only when ALL cross-pairs
  // are eligible, so a bridge article cannot chain two otherwise-unrelated
  // groups. Among mergeable pairs, pick the largest weakest-link (min shared
  // across cross-pairs); break ties by smallest member indices for determinism.
  let clusters: number[][] = raws.map((_, i) => [i])

  for (;;) {
    let best: { a: number; b: number; linkage: number } | null = null
    for (let a = 0; a < clusters.length; a++) {
      for (let b = a + 1; b < clusters.length; b++) {
        let mergeable = true
        let minShared = Infinity
        for (const ia of clusters[a]) {
          for (const ib of clusters[b]) {
            if (!eligible[ia][ib]) {
              mergeable = false
              break
            }
            if (sharedCount[ia][ib] < minShared) minShared = sharedCount[ia][ib]
          }
          if (!mergeable) break
        }
        if (!mergeable) continue
        if (
          best === null ||
          minShared > best.linkage ||
          (minShared === best.linkage &&
            (clusters[a][0] < clusters[best.a][0] ||
              (clusters[a][0] === clusters[best.a][0] &&
                clusters[b][0] < clusters[best.b][0])))
        ) {
          best = { a, b, linkage: minShared }
        }
      }
    }
    if (best === null) break
    const merged = [...clusters[best.a], ...clusters[best.b]].sort((x, y) => x - y)
    clusters[best.a] = merged
    clusters.splice(best.b, 1)
  }

  clusters.sort((c1, c2) => c1[0] - c2[0])
  return clusters.map((members) => members.map((i) => raws[i]))
}

export function debugClusterDetails(
  raws: RawSourceArticle[],
  opts: ClusterOptions,
): {
  total: number
  multi: Array<{ size: number; titles: string[]; keywords: string[] }>
  singletons: Array<{ source: string; title: string; keywords: string[] }>
} {
  const { keywordsPerArticle } = opts
  const indexed = raws.map((article) => ({
    article,
    keywords: extractKeywords(article.title, article.bodyText ?? "", keywordsPerArticle),
  }))

  const clusters = clusterArticles(raws, opts)
  const multi = clusters
    .filter((c) => c.length > 1)
    .map((c) => ({
      size: c.length,
      titles: c.map((a) => `${a.source}: ${a.title.slice(0, 100)}`),
      keywords: [
        ...new Set(
          c.flatMap((a) => indexed.find((it) => it.article === a)?.keywords ?? []),
        ),
      ].slice(0, 12),
    }))

  const singletons = clusters
    .filter((c) => c.length === 1)
    .slice(0, 40)
    .map((c) => {
      const a = c[0]
      const kws = indexed.find((it) => it.article === a)?.keywords ?? []
      return { source: a.source, title: a.title.slice(0, 100), keywords: kws.slice(0, 8) }
    })

  return { total: raws.length, multi, singletons }
}

export function readClusterOptionsFromEnv(): ClusterOptions {
  return {
    minSharedKeywords: toPositiveInt(process.env.CLUSTER_MIN_SHARED_KEYWORDS, 2),
    windowHours: toPositiveInt(process.env.CLUSTER_TIME_WINDOW_HOURS, 48),
    keywordsPerArticle: toPositiveInt(process.env.CLUSTER_KEYWORDS_PER_ARTICLE, 20),
  }
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const n = value ? Number(value) : NaN
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}
