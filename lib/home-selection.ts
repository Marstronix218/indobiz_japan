import type { NewsArticle } from "./news-data"

const DAY_MS = 24 * 60 * 60 * 1000

/** Scores an article for ordering. Matches `computePopularityScore`'s shape. */
export type ScoreOf = (article: NewsArticle, now: number) => number

function byScoreDesc(now: number, scoreOf: ScoreOf) {
  return (a: NewsArticle, b: NewsArticle) => scoreOf(b, now) - scoreOf(a, now)
}

/**
 * Auto-select "本日の重要ニュース": articles published within the last 24h,
 * ordered by `scoreOf`, capped at `limit`. If fewer than `limit` articles
 * fall inside the window, backfill with the next-best older ones so the
 * widget is never near-empty.
 */
export function selectImportantNews(
  articles: NewsArticle[],
  now: number,
  limit: number,
  scoreOf: ScoreOf,
): NewsArticle[] {
  const sorted = [...articles].sort(byScoreDesc(now, scoreOf))
  const cutoff = now - DAY_MS
  const within: NewsArticle[] = []
  const older: NewsArticle[] = []
  for (const a of sorted) {
    const ts = Date.parse(a.createdAt ?? a.publishedAt)
    if (!Number.isNaN(ts) && ts >= cutoff) within.push(a)
    else older.push(a)
  }
  return [...within, ...older].slice(0, limit)
}

/**
 * Resolve `rankedIds` (from 24h view counts) to articles in order, then
 * backfill by `scoreOf` up to `limit`. Unknown ids are skipped and no
 * article appears twice.
 */
export function mergeRankedArticles(
  rankedIds: string[],
  articles: NewsArticle[],
  limit: number,
  scoreOf: ScoreOf,
): NewsArticle[] {
  const byId = new Map(articles.map((a) => [a.id, a]))
  const result: NewsArticle[] = []
  const used = new Set<string>()
  for (const id of rankedIds) {
    const a = byId.get(id)
    if (a && !used.has(id)) {
      result.push(a)
      used.add(id)
    }
  }
  if (result.length < limit) {
    const now = Date.now()
    const backfill = [...articles]
      .filter((a) => !used.has(a.id))
      .sort(byScoreDesc(now, scoreOf))
    for (const a of backfill) {
      if (result.length >= limit) break
      result.push(a)
      used.add(a.id)
    }
  }
  return result.slice(0, limit)
}
