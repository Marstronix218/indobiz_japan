import type { NewsArticle } from "@/lib/news-data"
import { getServiceClient } from "@/lib/supabase/client"
import {
  BETA_PREVIEW_POOL_SIZE,
  BETA_REQUIRED_READS,
} from "@/lib/beta-config"

export type BetaAccessSource = "survey" | "line_friend" | "legacy_beta" | "admin"
export type BetaAccessEvent = "gate_view" | "survey_view"

export { BETA_REQUIRED_READS }

interface EntitlementRow {
  source: BetaAccessSource
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}

export interface BetaAccessStatus {
  hasFullAccess: boolean
  source: BetaAccessSource | null
  readsCount: number
  requiredReads: number
  surveyEligible: boolean
  surveyCompleted: boolean
}

function isActiveEntitlement(row: EntitlementRow, now: number): boolean {
  if (row.revoked_at) return false
  if (Date.parse(row.granted_at) > now) return false
  return row.expires_at === null || Date.parse(row.expires_at) > now
}

export async function listBetaPreviewArticleIds(): Promise<string[]> {
  const service = getServiceClient()
  const { data, error } = await service
    .from("beta_preview_articles")
    .select("article_id, display_order")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .limit(BETA_PREVIEW_POOL_SIZE)

  if (error) {
    console.error("[beta-access] preview list failed:", error.message)
    return []
  }

  if ((data ?? []).length > 0) {
    return (data ?? []).map((row) => row.article_id as string)
  }

  // A brand-new database may apply migrations before the first scrape. Seed
  // once when the table has never been configured; an intentionally disabled
  // pool (rows exist but active=false) stays disabled.
  const { count } = await service
    .from("beta_preview_articles")
    .select("article_id", { count: "exact", head: true })
  if (count !== 0) return []

  const { data: articles, error: articleError } = await service
    .from("articles")
    .select("id")
    .eq("workflow_status", "published")
    .order("published_at", { ascending: false })
    .limit(BETA_PREVIEW_POOL_SIZE)
  if (articleError || !articles?.length) {
    if (articleError) console.error("[beta-access] preview seed failed:", articleError.message)
    return []
  }

  const rows = articles.map((article, index) => ({
    article_id: article.id as string,
    display_order: index + 1,
    active: true,
  }))
  const { error: seedError } = await service
    .from("beta_preview_articles")
    .upsert(rows, { onConflict: "article_id", ignoreDuplicates: true })
  if (seedError) {
    console.error("[beta-access] preview seed insert failed:", seedError.message)
    return []
  }
  return rows.map((row) => row.article_id)
}

export async function getBetaAccessStatus(userId: string): Promise<BetaAccessStatus> {
  const service = getServiceClient()
  const [entitlementsResult, readsResult, surveyResult] = await Promise.all([
    service
      .from("access_entitlements")
      .select("source, granted_at, expires_at, revoked_at")
      .eq("user_id", userId)
      .order("granted_at", { ascending: false }),
    service.from("beta_article_reads").select("article_id").eq("user_id", userId),
    service
      .from("beta_survey_responses")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
  ])

  if (entitlementsResult.error) {
    console.error("[beta-access] entitlement lookup failed:", entitlementsResult.error.message)
  }
  if (readsResult.error) {
    console.error("[beta-access] read lookup failed:", readsResult.error.message)
  }
  if (surveyResult.error) {
    console.error("[beta-access] survey lookup failed:", surveyResult.error.message)
  }

  const activeEntitlement = ((entitlementsResult.data ?? []) as EntitlementRow[]).find((row) =>
    isActiveEntitlement(row, Date.now()),
  )
  // A read stays qualified even if editors later rotate that article out of
  // the active preview pool. Only the write path may create these rows.
  const readsCount = new Set(
    (readsResult.data ?? []).map((row) => row.article_id as string),
  ).size

  return {
    hasFullAccess: Boolean(activeEntitlement),
    source: activeEntitlement?.source ?? null,
    readsCount,
    requiredReads: BETA_REQUIRED_READS,
    surveyEligible: readsCount >= BETA_REQUIRED_READS,
    surveyCompleted: Boolean(surveyResult.data),
  }
}

export async function recordQualifiedBetaRead(
  userId: string,
  articleId: string,
): Promise<BetaAccessStatus> {
  const { error } = await getServiceClient().rpc("record_beta_read", {
    p_user_id: userId,
    p_article_id: articleId,
  })
  if (error) throw error

  return getBetaAccessStatus(userId)
}

export async function recordBetaAccessEvent(
  userId: string,
  event: BetaAccessEvent,
  articleId?: string,
): Promise<void> {
  const { error } = await getServiceClient().from("beta_access_events").insert({
    user_id: userId,
    event,
    article_id: articleId ?? null,
    metadata: {},
  })
  if (error) console.error("[beta-access] event insert failed:", error.message)
}

export function toPublicTeaserArticle(article: NewsArticle): NewsArticle {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary.slice(0, 160),
    source: article.source,
    publishedAt: article.publishedAt,
    category: article.category,
    industryTags: article.industryTags,
    implications: [],
    contentType: article.contentType,
    visibility: article.visibility,
    workflowStatus: article.workflowStatus,
    imageUrl: article.imageUrl,
    imageCaption: article.imageCaption,
    featured: article.featured,
    marketSnapshot: article.marketSnapshot,
  }
}
