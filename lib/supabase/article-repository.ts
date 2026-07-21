import type { SupabaseClient } from "@supabase/supabase-js"
import {
  type ArticleKeyword,
  type Category,
  type ContentType,
  type IndustryTag,
  type NewsArticle,
  type QualityCheckMeta,
  type QualityVerdict,
  type SourceProvenance,
  type Visibility,
  type WorkflowStatus,
  normalizeLegacyCategory,
  sanitizeArticleKeywords,
} from "@/lib/news-data"
import type { AuthorProfile } from "@/lib/authors"
import type { PipelineDraft } from "@/lib/automation"
import { extractKeywords } from "@/lib/clustering"
import { getServiceClient, hasSupabaseConfig } from "./client"

interface ArticleRow {
  id: string
  title: string
  summary: string
  source: string
  source_url: string | null
  published_at: string
  category: string
  industry_tags: string[]
  implications: string[]
  content_type: string
  visibility: string
  workflow_status: string
  image_url: string | null
  image_caption: string | null
  background_context: string | null
  japan_business_impact: string | null
  keywords: unknown
  featured: boolean
  is_synthesized: boolean
  author_name: string | null
  author_title: string | null
  author_bio: string | null
  author_avatar_url: string | null
  dedupe_key: string | null
  quality_verdict: string | null
  quality_notes: string | null
  revision_count: number | null
  last_quality_check_at: string | null
  created_at: string | null
  article_sources?: SourceRow[] | null
}

interface SourceRow {
  article_id: string
  source_name: string | null
  original_title: string
  original_url: string
  canonical_url: string | null
  original_published_at: string | null
  fetched_at: string | null
  extracted_by: string | null
  source_language: string | null
  evidence_snippets: string[]
  display_order: number
}

const ARTICLE_SELECT = `
  id, title, summary, source, source_url, published_at, category,
  industry_tags,
  implications, content_type, visibility, workflow_status,
  image_url, image_caption, background_context, japan_business_impact, keywords,
  featured, is_synthesized, dedupe_key,
  author_name, author_title, author_bio, author_avatar_url,
  quality_verdict, quality_notes, revision_count, last_quality_check_at,
  created_at,
  article_sources (
    article_id, source_name, original_title, original_url, canonical_url,
    original_published_at, fetched_at, extracted_by, source_language,
    evidence_snippets, display_order
  )
`

function isQualityVerdict(value: string | null): value is QualityVerdict {
  return value === "PASS" || value === "REVISION" || value === "REJECT"
}

function rowToQualityCheck(row: ArticleRow): QualityCheckMeta | undefined {
  if (!isQualityVerdict(row.quality_verdict)) return undefined
  return {
    verdict: row.quality_verdict,
    notes: row.quality_notes ?? undefined,
    revisionCount: row.revision_count ?? 0,
    checkedAt: row.last_quality_check_at ?? undefined,
  }
}

function rowToAuthor(row: ArticleRow): Partial<AuthorProfile> | undefined {
  if (!row.author_name) return undefined
  return {
    name: row.author_name,
    title: row.author_title ?? undefined,
    bio: row.author_bio ?? undefined,
    avatarUrl: row.author_avatar_url ?? undefined,
  }
}

function rowToProvenance(row: SourceRow): SourceProvenance {
  return {
    originalTitle: row.original_title,
    originalUrl: row.original_url,
    canonicalUrl: row.canonical_url ?? undefined,
    originalPublishedAt: row.original_published_at ?? undefined,
    fetchedAt: row.fetched_at ?? undefined,
    extractedBy: row.extracted_by ?? undefined,
    sourceLanguage: row.source_language ?? undefined,
    evidenceSnippets: row.evidence_snippets ?? [],
    sourceName: row.source_name ?? undefined,
  }
}

// keywords は jsonb なので DB 側では形が保証されない。壊れた値は空配列に落とし、
// 空配列は undefined として返す(UI 側の「値がなければセクション非表示」に合わせる)。
function rowToKeywords(value: unknown): ArticleKeyword[] | undefined {
  const keywords = sanitizeArticleKeywords(value)
  return keywords.length > 0 ? keywords : undefined
}

function rowToArticle(row: ArticleRow): NewsArticle {
  const sources = (row.article_sources ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(rowToProvenance)

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    publishedAt: row.published_at,
    createdAt: row.created_at ?? undefined,
    category: normalizeLegacyCategory(row.category),
    industryTags: (row.industry_tags ?? []) as IndustryTag[],
    implications: row.implications ?? [],
    contentType: row.content_type as ContentType,
    visibility: row.visibility as Visibility,
    workflowStatus: row.workflow_status as WorkflowStatus,
    imageUrl: row.image_url ?? undefined,
    imageCaption: row.image_caption ?? undefined,
    backgroundContext: row.background_context ?? undefined,
    japanBusinessImpact: row.japan_business_impact ?? undefined,
    keywords: rowToKeywords(row.keywords),
    featured: row.featured,
    isSynthesized: row.is_synthesized,
    author: rowToAuthor(row),
    provenance: sources[0],
    sources: sources.length > 0 ? sources : undefined,
    qualityCheck: rowToQualityCheck(row),
  }
}

export async function listPublishedArticles(
  client: SupabaseClient = getServiceClient(),
): Promise<NewsArticle[]> {
  if (!hasSupabaseConfig()) return []

  const { data, error } = await client
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("workflow_status", "published")
    .order("published_at", { ascending: false })
    // Homepage loads the whole published feed and filters/searches client-side,
    // so anything beyond this cap is unreachable from the main page. Kept well
    // above the current article count; revisit with server-side pagination if
    // the published set ever approaches this limit.
    .limit(500)

  if (error) {
    console.error("[supabase] listPublishedArticles failed:", error.message)
    return []
  }
  return (data as unknown as ArticleRow[] ?? []).map(rowToArticle)
}

export async function listAllArticles(): Promise<NewsArticle[]> {
  if (!hasSupabaseConfig()) return []

  const { data, error } = await getServiceClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .order("published_at", { ascending: false })
    // Admin lists every status (published/review/failed), so this is always
    // larger than the public feed (limit 500). Kept well above the current
    // count so older articles stay visible; revisit with server-side
    // pagination if the table ever approaches this cap.
    .limit(2000)

  if (error) {
    console.error("[supabase] listAllArticles failed:", error.message)
    return []
  }
  return (data as unknown as ArticleRow[] ?? []).map(rowToArticle)
}

export async function getArticleById(id: string): Promise<NewsArticle | null> {
  if (!hasSupabaseConfig()) return null

  const { data, error } = await getServiceClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[supabase] getArticleById failed:", error.message)
    return null
  }
  return data ? rowToArticle(data as unknown as ArticleRow) : null
}

export interface InsertArticleInput {
  title: string
  summary: string
  source: string
  sourceUrl?: string
  publishedAt: string
  category: Category
  industryTags: IndustryTag[]
  implications: string[]
  contentType: ContentType
  visibility: Visibility
  workflowStatus: WorkflowStatus
  imageUrl?: string
  imageCaption?: string | null
  backgroundContext?: string | null
  japanBusinessImpact?: string | null
  keywords?: ArticleKeyword[] | null
  featured?: boolean
  isSynthesized?: boolean
  author?: Partial<AuthorProfile>
  dedupeKey?: string
  sources?: SourceProvenance[]
  qualityCheck?: QualityCheckMeta
}

// jsonb 列へ入れる前に必ず正規化する(LLM・管理画面いずれ由来でも同じ制約を通す)。
// 空配列は null として保存し、「キーワードなし」を列の欠損と同じ扱いにする。
function toKeywordsJson(keywords: ArticleKeyword[] | null | undefined) {
  const sanitized = sanitizeArticleKeywords(keywords ?? [])
  return sanitized.length > 0 ? sanitized : null
}

function toRowInsert(input: InsertArticleInput) {
  return {
    title: input.title,
    summary: input.summary,
    source: input.source,
    source_url: input.sourceUrl ?? null,
    published_at: input.publishedAt,
    category: input.category,
    industry_tags: input.industryTags,
    implications: input.implications,
    content_type: input.contentType,
    visibility: input.visibility,
    workflow_status: input.workflowStatus,
    image_url: input.imageUrl ?? null,
    image_caption: input.imageCaption?.trim() || null,
    background_context: input.backgroundContext?.trim() || null,
    japan_business_impact: input.japanBusinessImpact?.trim() || null,
    keywords: toKeywordsJson(input.keywords),
    featured: input.featured ?? false,
    is_synthesized: input.isSynthesized ?? false,
    author_name: input.author?.name ?? null,
    author_title: input.author?.title ?? null,
    author_bio: input.author?.bio ?? null,
    author_avatar_url: input.author?.avatarUrl ?? null,
    dedupe_key: input.dedupeKey ?? null,
    quality_verdict: input.qualityCheck?.verdict ?? null,
    quality_notes: input.qualityCheck?.notes ?? null,
    revision_count: input.qualityCheck?.revisionCount ?? 0,
    last_quality_check_at: input.qualityCheck?.checkedAt ?? null,
  }
}

async function insertSourcesFor(
  client: SupabaseClient,
  articleId: string,
  sources: SourceProvenance[] | undefined,
) {
  if (!sources || sources.length === 0) return
  const rows = sources.map((s, i) => ({
    article_id: articleId,
    source_name: s.sourceName ?? null,
    original_title: s.originalTitle,
    original_url: s.originalUrl,
    canonical_url: s.canonicalUrl ?? null,
    original_published_at: s.originalPublishedAt ?? null,
    fetched_at: s.fetchedAt ?? null,
    extracted_by: s.extractedBy ?? null,
    source_language: s.sourceLanguage ?? null,
    evidence_snippets: s.evidenceSnippets ?? [],
    display_order: i,
  }))
  const { error } = await client.from("article_sources").insert(rows)
  if (error) {
    console.error("[supabase] insertSources failed:", error.message)
  }
}

export async function insertArticle(input: InsertArticleInput): Promise<NewsArticle | null> {
  const client = getServiceClient()
  const { data, error } = await client
    .from("articles")
    .insert(toRowInsert(input))
    .select("id")
    .single()

  if (error || !data) {
    console.error("[supabase] insertArticle failed:", error?.message)
    return null
  }

  await insertSourcesFor(client, data.id, input.sources)
  return getArticleByIdService(data.id)
}

async function getArticleByIdService(id: string): Promise<NewsArticle | null> {
  const { data, error } = await getServiceClient()
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[supabase] getArticleByIdService failed:", error.message)
    return null
  }
  return data ? rowToArticle(data as unknown as ArticleRow) : null
}

/** Service-role lookup used by authenticated admin mutation guards. */
export async function getArticleByIdForAdmin(id: string): Promise<NewsArticle | null> {
  return getArticleByIdService(id)
}

export interface InsertDraftsResult {
  inserted: number
  skipped: number
}

/**
 * Cross-run near-duplicate detection.
 *
 * The `dedupe_key` unique constraint only catches drafts whose *source
 * headline* slugifies identically, and `clusterArticles()` only merges raws
 * within a single pipeline run. A developing story covered by different
 * outlets (different headlines) across consecutive cron runs therefore slips
 * past both gates and produces multiple Japanese articles on the same topic
 * (e.g. the "ゴキブリ党" pair). This guard compares each draft's synthesized
 * Japanese title+summary against recently created articles and skips drafts
 * that share enough keywords with an existing same-category article.
 */
const DEDUPE_KEYWORDS_PER_ARTICLE = 20

function dedupeLookbackHours(): number {
  const n = Number(process.env.DEDUPE_LOOKBACK_HOURS)
  // Syndicated stories frequently reappear through another outlet just over
  // three days later. Keep a full week by default so cross-publisher semantic
  // dedupe can catch those delayed copies (the env var remains configurable).
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 168
}

function dedupeMinSharedKeywords(): number {
  const n = Number(process.env.DEDUPE_MIN_SHARED_KEYWORDS)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 6
}

interface RecentArticleKeywords {
  category: string
  keywords: Set<string>
}

async function loadRecentArticleKeywords(
  client: SupabaseClient,
): Promise<RecentArticleKeywords[]> {
  const sinceIso = new Date(
    Date.now() - dedupeLookbackHours() * 60 * 60 * 1000,
  ).toISOString()

  const { data, error } = await client
    .from("articles")
    .select("title, summary, category, created_at")
    .gte("created_at", sinceIso)

  if (error) {
    // Fail open: a dedup-lookup error must never block publication.
    console.error("[supabase] loadRecentArticleKeywords failed:", error.message)
    return []
  }

  return ((data ?? []) as { title: string; summary: string; category: string }[]).map(
    (row) => ({
      category: row.category,
      keywords: new Set(
        extractKeywords(row.title ?? "", row.summary ?? "", DEDUPE_KEYWORDS_PER_ARTICLE),
      ),
    }),
  )
}

/** True when `draftKeywords` shares ≥ threshold keywords with any same-category recent article. */
function isSemanticDuplicate(
  category: string,
  draftKeywords: Set<string>,
  recent: RecentArticleKeywords[],
): boolean {
  const threshold = dedupeMinSharedKeywords()
  for (const row of recent) {
    if (row.category !== category) continue
    let shared = 0
    for (const kw of draftKeywords) {
      if (row.keywords.has(kw)) {
        shared += 1
        if (shared >= threshold) return true
      }
    }
  }
  return false
}

export async function insertPipelineDrafts(
  drafts: PipelineDraft[],
): Promise<InsertDraftsResult> {
  if (!hasSupabaseConfig() || drafts.length === 0) {
    return { inserted: 0, skipped: drafts.length }
  }

  const client = getServiceClient()
  let inserted = 0
  let skipped = 0

  // Snapshot of recently created articles for near-duplicate detection. Drafts
  // inserted within this batch are appended so same-run duplicates are caught too.
  const recent = await loadRecentArticleKeywords(client)

  for (const draft of drafts) {
    const draftKeywords = new Set(
      extractKeywords(draft.title, draft.summary, DEDUPE_KEYWORDS_PER_ARTICLE),
    )
    if (isSemanticDuplicate(draft.category, draftKeywords, recent)) {
      console.warn(
        `[supabase] skipping near-duplicate draft (same-topic as recent article): ${draft.title}`,
      )
      skipped += 1
      continue
    }

    const input: InsertArticleInput = {
      title: draft.title,
      summary: draft.summary,
      source: draft.source,
      sourceUrl: draft.sourceUrl,
      publishedAt: draft.publishedAt,
      category: draft.category,
      industryTags: draft.industryTags,
      implications: draft.implications,
      contentType: draft.contentType,
      visibility: draft.visibility,
      workflowStatus: draft.workflowStatus,
      imageUrl: draft.imageUrl,
      imageCaption: draft.imageCaption,
      backgroundContext: draft.backgroundContext,
      japanBusinessImpact: draft.japanBusinessImpact,
      keywords: draft.keywords,
      featured: false,
      isSynthesized: draft.isSynthesized ?? false,
      dedupeKey: draft.dedupeKey,
      sources: draft.sources,
      qualityCheck: draft.qualityCheck,
    }

    const { data, error } = await client
      .from("articles")
      .insert(toRowInsert(input))
      .select("id")
      .single()

    if (error) {
      if (error.code === "23505") {
        skipped += 1
        continue
      }
      console.error("[supabase] insertPipelineDrafts failed:", error.message)
      skipped += 1
      continue
    }

    if (data) {
      await insertSourcesFor(client, data.id, input.sources)
      inserted += 1
      recent.push({ category: draft.category, keywords: draftKeywords })
    }
  }

  return { inserted, skipped }
}

export interface UpdateArticleInput extends Partial<InsertArticleInput> {}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
): Promise<NewsArticle | null> {
  const client = getServiceClient()
  const row: Record<string, unknown> = {}
  if (input.title !== undefined) row.title = input.title
  if (input.summary !== undefined) row.summary = input.summary
  if (input.source !== undefined) row.source = input.source
  if (input.sourceUrl !== undefined) row.source_url = input.sourceUrl ?? null
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt
  if (input.category !== undefined) row.category = input.category
  if (input.industryTags !== undefined) row.industry_tags = input.industryTags
  if (input.implications !== undefined) row.implications = input.implications
  if (input.contentType !== undefined) row.content_type = input.contentType
  if (input.visibility !== undefined) row.visibility = input.visibility
  if (input.workflowStatus !== undefined) row.workflow_status = input.workflowStatus
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl ?? null
  if (input.imageCaption !== undefined) {
    row.image_caption = input.imageCaption?.trim() || null
  }
  if (input.backgroundContext !== undefined) {
    row.background_context = input.backgroundContext?.trim() || null
  }
  if (input.japanBusinessImpact !== undefined) {
    row.japan_business_impact = input.japanBusinessImpact?.trim() || null
  }
  if (input.keywords !== undefined) row.keywords = toKeywordsJson(input.keywords)
  if (input.featured !== undefined) row.featured = input.featured
  if (input.isSynthesized !== undefined) row.is_synthesized = input.isSynthesized
  if (input.author !== undefined) {
    row.author_name = input.author.name ?? null
    row.author_title = input.author.title ?? null
    row.author_bio = input.author.bio ?? null
    row.author_avatar_url = input.author.avatarUrl ?? null
  } else if (input.category !== undefined && input.category !== "column") {
    // Category switched away from column — drop any stale author profile.
    row.author_name = null
    row.author_title = null
    row.author_bio = null
    row.author_avatar_url = null
  }
  if (input.qualityCheck !== undefined) {
    row.quality_verdict = input.qualityCheck?.verdict ?? null
    row.quality_notes = input.qualityCheck?.notes ?? null
    row.revision_count = input.qualityCheck?.revisionCount ?? 0
    row.last_quality_check_at = input.qualityCheck?.checkedAt ?? null
  }

  const { error } = await client.from("articles").update(row).eq("id", id)
  if (error) {
    console.error("[supabase] updateArticle failed:", error.message)
    return null
  }

  if (input.sources) {
    await client.from("article_sources").delete().eq("article_id", id)
    await insertSourcesFor(client, id, input.sources)
  }

  return getArticleByIdService(id)
}

export async function deleteArticle(id: string): Promise<boolean> {
  const { error } = await getServiceClient().from("articles").delete().eq("id", id)
  if (error) {
    console.error("[supabase] deleteArticle failed:", error.message)
    return false
  }
  return true
}

export interface DailyGenerationStat {
  /** Calendar date in JST, `YYYY-MM-DD`. */
  date: string
  /** Articles created (DB rows) on that day. */
  articles: number
  /** Articles which are currently public. */
  published: number
  /** Articles held for editorial review, including REJECT. */
  review: number
  /** Persisted rows whose pipeline status is failed. */
  failed: number
  /** Review rows whose editorial verdict is REJECT. */
  rejected: number
  /** Articles created with an image URL set on that day. */
  images: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const JST_OFFSET_MS = 9 * 60 * 60 * 1000

/** Calendar date (`YYYY-MM-DD`) of an ISO timestamp in JST (UTC+9, no DST). */
function jstDate(iso: string): string {
  return new Date(new Date(iso).getTime() + JST_OFFSET_MS)
    .toISOString()
    .slice(0, 10)
}

/**
 * Counts articles and image-bearing articles created per day over the last
 * `days` days, bucketed by JST calendar date and zero-filled so the series has
 * no gaps. Used by the admin dashboard generation graph.
 */
export async function getDailyGenerationStats(
  days = 30,
): Promise<DailyGenerationStat[]> {
  if (!hasSupabaseConfig()) return []

  const sinceIso = new Date(Date.now() - days * DAY_MS).toISOString()
  const { data, error } = await getServiceClient()
    .from("articles")
    .select("created_at, image_url, workflow_status, quality_verdict")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[supabase] getDailyGenerationStats failed:", error.message)
    return []
  }

  // Pre-seed every day in the window (oldest → newest) so the chart is continuous.
  const buckets = new Map<string, DailyGenerationStat>()
  for (let i = days - 1; i >= 0; i--) {
    const date = jstDate(new Date(Date.now() - i * DAY_MS).toISOString())
    buckets.set(date, {
      date,
      articles: 0,
      published: 0,
      review: 0,
      failed: 0,
      rejected: 0,
      images: 0,
    })
  }

  for (const row of (data ?? []) as {
    created_at: string
    image_url: string | null
    workflow_status: string
    quality_verdict: string | null
  }[]) {
    const bucket = buckets.get(jstDate(row.created_at))
    if (!bucket) continue // row landed just outside the JST window — skip
    bucket.articles += 1
    if (row.workflow_status === "published") bucket.published += 1
    else if (row.workflow_status === "review") bucket.review += 1
    else if (row.workflow_status === "failed") bucket.failed += 1
    if (row.quality_verdict === "REJECT") bucket.rejected += 1
    if (row.image_url) bucket.images += 1
  }

  return [...buckets.values()]
}

/**
 * Record a single article view for the beta access-ranking widget.
 * Fail-open: never throws, so a logging failure can't break the reader page.
 */
export async function recordArticleView(articleId: string, userId: string): Promise<void> {
  if (!hasSupabaseConfig()) return
  try {
    const { error } = await getServiceClient()
      .from("article_view_events")
      .upsert(
        { article_id: articleId, user_id: userId },
        { onConflict: "user_id,article_id,view_date", ignoreDuplicates: true },
      )
    if (error) {
      console.error("[supabase] recordArticleView failed:", error.message)
    }
  } catch (err) {
    console.error("[supabase] recordArticleView threw:", err)
  }
}

/**
 * Article IDs with the most views in the last `hours`, most-viewed first.
 * Used by the homepage access-ranking widget. Fails open to an empty array,
 * in which case the widget falls back to popularity-score ordering.
 */
export async function getTopViewedArticleIds(
  hours = 24,
  limit = 5,
): Promise<string[]> {
  if (!hasSupabaseConfig()) return []
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  try {
    const { data, error } = await getServiceClient()
      .from("article_view_events")
      .select("article_id")
      .gte("viewed_at", since)
    if (error) {
      console.error("[supabase] getTopViewedArticleIds failed:", error.message)
      return []
    }
    const counts = new Map<string, number>()
    for (const row of (data as { article_id: string }[] | null) ?? []) {
      counts.set(row.article_id, (counts.get(row.article_id) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)
  } catch (err) {
    console.error("[supabase] getTopViewedArticleIds threw:", err)
    return []
  }
}
