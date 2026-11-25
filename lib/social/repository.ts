import { getServiceClient } from "@/lib/supabase/client"

/** `social_posts` テーブル(migration 0011)へのアクセス。失敗はすべて throw する。 */

export type SocialPlatform = "x" | "linkedin"

export interface SocialPostReservation {
  id: string
}

/** その日(JST)にすでに投稿済み、または投稿処理中の行があるか。 */
export async function hasPostForDay(platform: SocialPlatform, postedOn: string): Promise<boolean> {
  const { data, error } = await getServiceClient()
    .from("social_posts")
    .select("id")
    .eq("platform", platform)
    .eq("posted_on", postedOn)
    .neq("status", "failed")
    .limit(1)
  if (error) throw new Error(`social_posts lookup failed: ${error.message}`)
  return (data ?? []).length > 0
}

/** 過去に投稿した(または処理中の)記事IDの集合。 */
export async function listPostedArticleIds(
  platform: SocialPlatform,
  articleIds: readonly string[],
): Promise<Set<string>> {
  if (articleIds.length === 0) return new Set()
  const { data, error } = await getServiceClient()
    .from("social_posts")
    .select("article_id")
    .eq("platform", platform)
    .neq("status", "failed")
    .in("article_id", articleIds as string[])
  if (error) throw new Error(`social_posts lookup failed: ${error.message}`)
  return new Set((data ?? []).map((row) => row.article_id as string))
}

/**
 * 投稿前に「予約行」を入れる。部分ユニーク索引により、同じ日・同じ記事の
 * 予約は1件しか通らないので、スケジュールが二重に発火しても投稿は1回になる。
 * 競合で負けた場合は null を返す。
 */
export async function reservePost(input: {
  platform: SocialPlatform
  articleId: string
  postedOn: string
  text: string
}): Promise<SocialPostReservation | null> {
  const { data, error } = await getServiceClient()
    .from("social_posts")
    .insert({
      platform: input.platform,
      article_id: input.articleId,
      posted_on: input.postedOn,
      post_text: input.text,
      status: "pending",
    })
    .select("id")
    .single()
  if (error) {
    if (error.code === "23505") return null
    throw new Error(`social_posts insert failed: ${error.message}`)
  }
  return { id: data.id as string }
}

export async function markPosted(id: string, externalId: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("social_posts")
    .update({ status: "posted", external_id: externalId, updated_at: new Date().toISOString() })
    .eq("id", id)
  // 投稿自体は成功しているので throw しない。pending のまま残っても再投稿は防げる。
  if (error) console.error("[social] markPosted failed:", error.message)
}

/** 投稿されたか分からない失敗。status は pending のまま(日と記事をロックしたまま)、エラーだけ残す。 */
export async function recordUnknownOutcome(id: string, message: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("social_posts")
    .update({ error: `outcome unknown: ${message}`.slice(0, 2000), updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) console.error("[social] recordUnknownOutcome failed:", error.message)
}

export async function markFailed(id: string, message: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("social_posts")
    .update({ status: "failed", error: message.slice(0, 2000), updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) console.error("[social] markFailed failed:", error.message)
}
