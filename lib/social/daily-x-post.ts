import { getArticleTakeaways } from "@/lib/article-takeaways"
import { articlePath } from "@/lib/article-slug"
import {
  CATEGORY_LABELS,
  articleDisplayDate,
  computePopularityScore,
  type NewsArticle,
} from "@/lib/news-data"
import { SITE_URL } from "@/lib/site-config"
import { listPublishedArticlesCreatedSince } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { XApiError, postTweet, readXCredentialsFromEnv } from "./x-client"
import {
  hasPostForSlot,
  listPostedArticleIds,
  markFailed,
  markPosted,
  recordUnknownOutcome,
  reservePost,
} from "./repository"
import { composeXPost, jstDateKey, postSlotFor, type PostSlot } from "./x-text"

/**
 * 候補にする記事の作成時刻の幅。scrape cron(毎朝6時台JST)の記事を拾う。
 * 24時間ちょうどだと、scrapeが遅れた日に前日分が窓から外れるので少し広げる。
 * 同じ記事の再投稿は social_posts で防いでいる。
 */
const CANDIDATE_WINDOW_HOURS = 30

export type DailyXPostResult =
  | { status: "posted"; slot: PostSlot; articleId: string; postId: string; text: string }
  | { status: "dry_run"; slot: PostSlot; articleId: string; text: string }
  | { status: "skipped"; reason: string }

/** ホームのヒーロー枠と同じ順位付け(人気スコア→新しさ)で1位を選ぶ。 */
export function pickTopArticle(
  articles: readonly NewsArticle[],
  excludeIds: ReadonlySet<string>,
  now: number = Date.now(),
): NewsArticle | null {
  const candidates = articles.filter((a) => !excludeIds.has(a.id))
  candidates.sort((left, right) => {
    const diff = computePopularityScore(right, now) - computePopularityScore(left, now)
    if (diff !== 0) return diff
    return (
      new Date(articleDisplayDate(right)).getTime() - new Date(articleDisplayDate(left)).getTime()
    )
  })
  return candidates[0] ?? null
}

/** 見出しの次に添える一文。本記事のポイントの1つ目、無ければ要約の最初の文。 */
function leadFor(article: NewsArticle): string {
  const [first] = getArticleTakeaways(article.implications ?? [])
  if (first) return first
  const firstSentence = article.summary?.split(/(?<=。)/)[0]?.trim()
  return firstSentence ?? ""
}

export function buildXPostText(article: NewsArticle): string {
  return composeXPost({
    title: article.title,
    categoryLabel: CATEGORY_LABELS[article.category],
    lead: leadFor(article),
    url: `${SITE_URL}${articlePath(article)}`,
  })
}

export async function runDailyXPost(options: {
  dryRun?: boolean
  now?: Date
  /** 省略時は実行時刻(JST)から朝・昼・夜を判定する。 */
  slot?: PostSlot
} = {}): Promise<DailyXPostResult> {
  const now = options.now ?? new Date()
  const postedOn = jstDateKey(now)
  const slot = options.slot ?? postSlotFor(now)

  if (!hasSupabaseConfig()) return { status: "skipped", reason: "supabase_not_configured" }

  const credentials = readXCredentialsFromEnv()
  if (!credentials && !options.dryRun) {
    return { status: "skipped", reason: "x_credentials_not_configured" }
  }

  // 記録テーブルが読めない(migration未適用など)なら投稿しない。二重投稿よりは見送りを選ぶ。
  if (!options.dryRun && (await hasPostForSlot("x", postedOn, slot))) {
    return { status: "skipped", reason: `already_posted_for_${postedOn}_${slot}` }
  }

  const sinceIso = new Date(now.getTime() - CANDIDATE_WINDOW_HOURS * 3_600_000).toISOString()
  const articles = await listPublishedArticlesCreatedSince(sinceIso)
  if (articles.length === 0) return { status: "skipped", reason: "no_recent_articles" }

  const articleIds = articles.map((a) => a.id)
  // ドライランは migration 適用前でも文面を確認できるよう、履歴が読めなくても続ける。
  const alreadyPosted = options.dryRun
    ? await listPostedArticleIds("x", articleIds).catch(() => new Set<string>())
    : await listPostedArticleIds("x", articleIds)
  const top = pickTopArticle(articles, alreadyPosted, now.getTime())
  if (!top) return { status: "skipped", reason: "all_recent_articles_already_posted" }

  const text = buildXPostText(top)
  if (options.dryRun) return { status: "dry_run", slot, articleId: top.id, text }

  const reservation = await reservePost({ platform: "x", articleId: top.id, postedOn, slot, text })
  if (!reservation) return { status: "skipped", reason: "concurrent_run_won" }

  try {
    const { id } = await postTweet(text, credentials!)
    await markPosted(reservation.id, id)
    return { status: "posted", slot, articleId: top.id, postId: id, text }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    // Xが明確に拒否した(4xx)ときだけ failed にして、その枠の再実行を許す。
    // タイムアウト・通信断・5xx・IDなし2xx は「実は投稿されている」可能性があるので
    // pending のまま残して枠をロックする(二重投稿より見送りを選ぶ)。
    // タイムラインを確認して未投稿なら、行を failed に更新すれば再実行できる。
    const definitelyRejected =
      error instanceof XApiError && error.status >= 400 && error.status < 500
    if (definitelyRejected) {
      await markFailed(reservation.id, message)
    } else {
      await recordUnknownOutcome(reservation.id, message)
    }
    throw error
  }
}
