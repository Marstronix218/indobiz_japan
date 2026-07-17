import {
  type Category,
  INDUSTRY_LABELS,
  type IndustryTag,
  type NewsArticle,
  type QualityCheckMeta,
  type SourceProvenance,
  type WorkflowStatus,
  normalizeLegacyCategory,
} from "@/lib/news-data"
import { cleanText } from "@/lib/summary-utils"
import { isLikelyArticleUrl } from "@/lib/source-url-utils"
import { clusterArticles, readClusterOptionsFromEnv } from "@/lib/clustering"
import {
  LLMError,
  getLLMClient,
  type LLMClient,
  type QualityCheckOutput,
  type SynthesisOutput,
  type SynthesisSource,
} from "@/lib/llm"
import {
  ImageGenerationError,
  getImageClient,
  type ImageClient,
} from "@/lib/image-gen"
import { buildSafeImagePrompt } from "@/lib/image-gen/safe-prompt"
import {
  fetchArticleBody,
  fetchSimilarArticles,
  buildEvidenceSnippets,
  isGoogleNewsArticleUrl,
  isUsableArticleBody,
  resolveGoogleNewsUrl,
} from "@/lib/scrapers/fetch-india-news"
import { isCoreFirstSynthesisEnabled } from "@/lib/llm/prompt"
import { normalizeSourceTitle, normalizeSourceUrl } from "@/lib/llm/source-policy"
import { runDeterministicQualityGuard } from "@/lib/llm/output-quality-guard"

export type ConnectorMode = "rss" | "api"

export interface SourceConnector {
  id: string
  name: string
  mode: ConnectorMode
  endpointLabel: string
  enabled: boolean
  priority: number
}

export interface RawSourceArticle {
  connectorId: string
  externalId: string
  source: string
  title: string
  url: string
  publishedAt: string
  bodyText: string
  imageUrl?: string
  originalTitle?: string
  originalPublishedAt?: string
  canonicalUrl?: string
  fetchedAt?: string
  extractedBy?: string
  sourceLanguage?: string
  evidenceSnippets?: string[]
  legacyCategory?: string
  industryHints?: IndustryTag[]
}

export interface PipelineDraft
  extends Omit<NewsArticle, "id" | "featured"> {
  dedupeKey: string
  originConnectorIds: string[]
  failureReason?: string
}

export interface PipelineResult {
  published: PipelineDraft[]
  reviewQueue: PipelineDraft[]
  failed: PipelineDraft[]
}

export const SOURCE_CONNECTORS: SourceConnector[] = [
  {
    id: "reuters-india-rss",
    name: "Reuters India RSS",
    mode: "rss",
    endpointLabel: "RSS feed",
    enabled: true,
    priority: 1,
  },
  {
    id: "rbi-api",
    name: "RBI Bulletin API",
    mode: "api",
    endpointLabel: "Official API",
    enabled: true,
    priority: 2,
  },
  {
    id: "pib-business-rss",
    name: "PIB Business RSS",
    mode: "rss",
    endpointLabel: "RSS feed",
    enabled: true,
    priority: 3,
  },
]

const KNOWN_INDUSTRY_TAGS: IndustryTag[] = [
  "automotive", "semiconductor", "machine_tools", "food", "chemicals",
  "logistics", "agriculture", "steel", "education", "entertainment", "talent",
]
const KNOWN_TAG_SET = new Set<string>(KNOWN_INDUSTRY_TAGS)
const MIN_EVIDENCE_BODY_CHARS = 220
const MIN_CLUSTER_EVIDENCE_CHARS = 360

const CJK_TITLE_REGEX = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]/

export function buildDedupeKey(title: string) {
  return cleanText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .join("-")
}

/** @deprecated fallback only — LLM失敗時の暫定要約に使用 */
export function translateToJapanesePreview(bodyText: string) {
  const cleaned = cleanText(bodyText)
  if (!cleaned) return ""
  return cleaned.slice(0, 2400)
}

/** @deprecated fallback only — LLM失敗時の暫定要約に使用 */
export function buildSummary(bodyText: string) {
  const translated = translateToJapanesePreview(bodyText)
  return cleanText(translated).slice(0, 560)
}

/** @deprecated fallback only — LLM失敗時の示唆テンプレート */
export function buildImplications(
  industryTags: IndustryTag[],
  category: Category,
): string[] {
  const firstTag = industryTags[0]
  const tagLabel = firstTag ? INDUSTRY_LABELS[firstTag] : "対象市場"

  if (category === "regulation") {
    return [
      "注意点: 制度運用が固まるまで対外説明を急がない。",
      "次アクション: 法務・通関・現地営業で影響範囲を確認する。",
      `監視対象: ${tagLabel} 領域の実務運用を継続監視する。`,
    ]
  }

  return [
    `${tagLabel}領域の提案材料になり得る。`,
    "一次ソースと現地実務の差分確認が必要だ。",
    "進出・採用計画への影響を優先度付けする。",
  ]
}

/** @deprecated cluster ベースに移行 — 参照コードのための互換エクスポート */
export function dedupeArticles(rawArticles: RawSourceArticle[]) {
  const grouped = new Map<string, RawSourceArticle[]>()

  rawArticles.forEach((article) => {
    const key = buildDedupeKey(article.title)
    const group = grouped.get(key) ?? []
    group.push(article)
    grouped.set(key, group)
  })

  return grouped
}

function toProvenance(article: RawSourceArticle): SourceProvenance {
  return {
    originalTitle: article.originalTitle ?? article.title,
    originalUrl: article.url,
    canonicalUrl: article.canonicalUrl,
    originalPublishedAt: article.originalPublishedAt ?? article.publishedAt,
    fetchedAt: article.fetchedAt,
    extractedBy: article.extractedBy,
    sourceLanguage: article.sourceLanguage,
    evidenceSnippets: article.evidenceSnippets,
    sourceName: article.source,
  }
}

// 主軸＋肉付け方式が有効なときは「本文が最も充実した1本」を核(=primary)に選ぶ。
// 無効なら従来どおり connectorId のアルファベット順(挙動互換のため)。
function pickPrimary(cluster: RawSourceArticle[]): RawSourceArticle {
  if (isCoreFirstSynthesisEnabled()) {
    return [...cluster].sort((a, b) => (b.bodyText?.length ?? 0) - (a.bodyText?.length ?? 0))[0]
  }
  return [...cluster].sort((a, b) => a.connectorId.localeCompare(b.connectorId))[0]
}

function normalizeTagList(tags: string[]): IndustryTag[] {
  const result: IndustryTag[] = []
  for (const t of tags) {
    if (KNOWN_TAG_SET.has(t)) result.push(t as IndustryTag)
  }
  return Array.from(new Set(result))
}

function isGoogleNewsUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    return new URL(url).hostname.toLowerCase() === "news.google.com"
  } catch {
    return false
  }
}

function sentenceCount(text: string): number {
  return text
    .split(/[.!?。！？]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 20).length
}

function isTitleOnlyEvidence(article: RawSourceArticle): boolean {
  const title = cleanText(article.originalTitle ?? article.title)
  const body = cleanText(article.bodyText ?? "")
  if (!title || !body) return true

  const titleKey = normalizeSourceTitle(title)
  const bodyKey = normalizeSourceTitle(body)
  if (!bodyKey) return true
  if (bodyKey === titleKey) return true
  if (body.length <= title.length + 40 && bodyKey.includes(titleKey)) return true
  return sentenceCount(body) < 2 && body.length < MIN_EVIDENCE_BODY_CHARS
}

function evidenceProblem(article: RawSourceArticle): string | null {
  const body = cleanText(article.bodyText ?? "")
  if (isGoogleNewsUrl(article.url) || isGoogleNewsUrl(article.canonicalUrl)) {
    return "Google NewsリダイレクトURLのまま本文根拠に使われている"
  }
  if (isTitleOnlyEvidence(article)) {
    return "本文がタイトルのみ、または実質的な本文根拠が不足している"
  }
  if (body.length < MIN_EVIDENCE_BODY_CHARS) {
    return `本文根拠が短すぎる (${body.length}字)`
  }
  if (!isUsableArticleBody(body, article.originalTitle ?? article.title)) {
    return "取得本文が見出しと対応しない、または著者紹介・購読導線などのボイラープレートである"
  }
  return null
}

function filterEvidenceSources(cluster: RawSourceArticle[]) {
  const usable: RawSourceArticle[] = []
  const rejected: Array<{ title: string; reason: string }> = []

  for (const article of cluster) {
    const reason = evidenceProblem(article)
    if (reason) {
      rejected.push({ title: article.title, reason })
    } else {
      usable.push(article)
    }
  }

  return { usable, rejected }
}

function buildFailedDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  reason: string,
  summary = "",
): PipelineDraft {
  const category = normalizeLegacyCategory(primary.legacyCategory ?? "economy")
  const industryTags = primary.industryHints ?? []
  const sources = cluster.map(toProvenance)
  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: primary.title,
    summary,
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: [],
    contentType: "news",
    visibility: "member",
    workflowStatus: "failed",
    originConnectorIds: cluster.map((item) => item.connectorId),
    failureReason: reason,
    isSynthesized: false,
  }
}

function buildFallbackDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  failureReason: string,
): PipelineDraft {
  const summary = buildSummary(primary.bodyText)
  const category = normalizeLegacyCategory(primary.legacyCategory ?? "economy")
  const industryTags = primary.industryHints ?? []
  const sources = cluster.map(toProvenance)

  if (!summary) {
    return buildFailedDraft(cluster, primary, "要約生成に失敗")
  }

  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: primary.title,
    summary,
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: cluster.length > 1 ? `${primary.source}、他${cluster.length - 1}件` : primary.source,
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: buildImplications(industryTags, category),
    contentType: "news",
    visibility: "member",
    workflowStatus: "review",
    originConnectorIds: cluster.map((item) => item.connectorId),
    failureReason,
    isSynthesized: false,
  }
}

function readIndiaRelevanceMin(): number {
  const raw = Number(process.env.INDIA_RELEVANCE_MIN)
  if (!Number.isFinite(raw)) return 2
  return Math.max(0, Math.min(3, Math.round(raw)))
}

function readJapaneseBusinessRelevanceMin(): number {
  const raw = Number(process.env.JP_BUSINESS_RELEVANCE_MIN)
  if (!Number.isFinite(raw)) return 2
  return Math.max(0, Math.min(3, Math.round(raw)))
}

function isQualityCheckEnabled(): boolean {
  return process.env.QUALITY_CHECK_ENABLED === "1"
}

function readQualityMaxRevisions(): number {
  const raw = Number(process.env.QUALITY_MAX_REVISIONS)
  if (!Number.isFinite(raw)) return 2
  return Math.max(0, Math.min(5, Math.round(raw)))
}

interface QualityLoopResult {
  output: SynthesisOutput
  qualityCheck: QualityCheckMeta
  forceReview: boolean
}

function joinIssueNotes(parts: (string | undefined | null)[]): string | undefined {
  const cleaned = parts.map((p) => (p ?? "").trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join("\n") : undefined
}

async function runQualityLoop(
  llm: LLMClient,
  initialOutput: SynthesisOutput,
  synthInput: SynthesisSource[],
  primary: RawSourceArticle,
): Promise<QualityLoopResult> {
  const maxRevisions = readQualityMaxRevisions()
  let currentOutput = initialOutput
  let attempts = 0
  let lastIssuesText: string | undefined

  while (true) {
    let qc: QualityCheckOutput
    const deterministicQc = runDeterministicQualityGuard(currentOutput, synthInput)
    if (deterministicQc) {
      qc = deterministicQc
    } else {
      try {
        qc = await llm.checkQuality({ output: currentOutput, cluster: synthInput })
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.warn(
          `[automation:quality] checkQuality失敗 (title="${primary.title}"): ${msg}`,
        )
        return {
          output: currentOutput,
          qualityCheck: {
            verdict: "REVISION",
            notes: joinIssueNotes([
              lastIssuesText,
              `品質チェック自体が失敗しました: ${msg}`,
            ]),
            revisionCount: attempts,
            checkedAt: new Date().toISOString(),
          },
          forceReview: true,
        }
      }
    }

    lastIssuesText = qc.issues.length > 0 ? qc.issues.join("\n") : undefined

    if (qc.verdict === "PASS") {
      return {
        output: currentOutput,
        qualityCheck: {
          verdict: "PASS",
          notes: lastIssuesText,
          revisionCount: attempts,
          checkedAt: new Date().toISOString(),
        },
        forceReview: false,
      }
    }

    if (qc.verdict === "REJECT") {
      return {
        output: currentOutput,
        qualityCheck: {
          verdict: "REJECT",
          notes: lastIssuesText,
          revisionCount: attempts,
          checkedAt: new Date().toISOString(),
        },
        forceReview: true,
      }
    }

    if (attempts >= maxRevisions || !qc.revisionInstructions) {
      const exhaustedNote = attempts >= maxRevisions
        ? `(修正回数上限 ${maxRevisions} 到達)`
        : "(修正指示が空のため再生成不可)"
      return {
        output: currentOutput,
        qualityCheck: {
          verdict: "REVISION",
          notes: joinIssueNotes([lastIssuesText, exhaustedNote]),
          revisionCount: attempts,
          checkedAt: new Date().toISOString(),
        },
        forceReview: true,
      }
    }

    try {
      currentOutput = await llm.reviseSynthesis({
        cluster: synthInput,
        previousOutput: currentOutput,
        revisionInstructions: qc.revisionInstructions,
        categoryHint: primary.legacyCategory,
        industryHints: primary.industryHints,
      })
      attempts += 1
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(
        `[automation:quality] reviseSynthesis失敗 (title="${primary.title}"): ${msg}`,
      )
      return {
        output: currentOutput,
        qualityCheck: {
          verdict: "REVISION",
          notes: joinIssueNotes([lastIssuesText, `再生成失敗: ${msg}`]),
          revisionCount: attempts,
          checkedAt: new Date().toISOString(),
        },
        forceReview: true,
      }
    }
  }
}

function buildSynthesizedDraft(
  cluster: RawSourceArticle[],
  primary: RawSourceArticle,
  output: SynthesisOutput,
  opts?: { qualityCheck?: QualityCheckMeta; forceReview?: boolean },
): PipelineDraft {
  const category = normalizeLegacyCategory(output.category || primary.legacyCategory || "economy")
  const llmTags = normalizeTagList(output.industryTags)
  const industryTags = llmTags.length > 0 ? llmTags : primary.industryHints ?? []
  // Preserve the complete provenance captured by the scraper/body-enrichment
  // phase.  Rebuilding sources from the LLM's title+URL output used to discard
  // source_name, canonical URL, timestamps, extraction method and all evidence
  // snippets, making later editorial audits impossible.
  const referencedRawSources = output.referenceUrls.map((ref) => {
    const urlKey = normalizeSourceUrl(ref.url)
    const titleKey = normalizeSourceTitle(ref.title)
    return cluster.find((item) =>
      normalizeSourceUrl(item.canonicalUrl ?? item.url) === urlKey ||
      normalizeSourceUrl(item.url) === urlKey ||
      normalizeSourceTitle(item.originalTitle ?? item.title) === titleKey
    )
  })
  const sources: SourceProvenance[] = output.referenceUrls.map((ref, index) => {
    const matched = referencedRawSources[index]
    return matched
      ? toProvenance(matched)
      : { originalTitle: ref.title, originalUrl: ref.url }
  })
  const usedSourceNames = referencedRawSources
    .filter((source): source is RawSourceArticle => Boolean(source))
    .map((source) => source.source)

  const baseStatus: WorkflowStatus =
    category === "regulation" && sources.length < 2 ? "review" : "published"
  const workflowStatus: WorkflowStatus = opts?.forceReview ? "review" : baseStatus

  return {
    dedupeKey: buildDedupeKey(primary.title),
    title: output.title || primary.title,
    summary: output.summary.trim(),
    imageUrl: primary.imageUrl,
    provenance: sources[0],
    sources,
    source: usedSourceNames.length > 1
      ? `${usedSourceNames[0]}、他${usedSourceNames.length - 1}件`
      : usedSourceNames[0] ?? primary.source,
    sourceUrl: sources[0]?.canonicalUrl ?? sources[0]?.originalUrl ?? primary.url,
    publishedAt: primary.publishedAt,
    category,
    industryTags,
    implications: output.implications,
    backgroundContext: output.backgroundContext,
    japanBusinessImpact: output.japanBusinessImpact,
    keywords: output.keywords,
    imageCaption: output.imageCaption,
    contentType: "news",
    visibility: workflowStatus === "review" ? "member" : "public",
    workflowStatus,
    originConnectorIds: cluster.map((item) => item.connectorId),
    isSynthesized: true,
    qualityCheck: opts?.qualityCheck,
  }
}

async function buildDraft(
  cluster: RawSourceArticle[],
  llm: LLMClient | null,
  imageClient: ImageClient | null,
): Promise<PipelineDraft> {
  const { usable, rejected } = filterEvidenceSources(cluster)
  const evidenceCluster = usable.length > 0 ? usable : cluster
  const primary = pickPrimary(evidenceCluster)

  if (usable.length === 0) {
    const reasons = rejected
      .map((item) => `${item.reason}: ${item.title}`)
      .slice(0, 3)
      .join(" / ")
    return buildFailedDraft(
      cluster,
      primary,
      `生成に足る本文根拠がないため除外: ${reasons}`,
    )
  }

  const totalEvidenceChars = usable.reduce(
    (sum, article) => sum + cleanText(article.bodyText ?? "").length,
    0,
  )
  if (totalEvidenceChars < MIN_CLUSTER_EVIDENCE_CHARS) {
    return buildFailedDraft(
      cluster,
      primary,
      `生成に足る本文根拠が短すぎる (${totalEvidenceChars}字)`,
    )
  }

  if (process.env.REQUIRE_MULTI_SOURCE === "1" && evidenceCluster.length < 2) {
    return buildFailedDraft(cluster, primary, "単独ソースのため著作権配慮で除外")
  }

  if (!isLikelyArticleUrl(primary.url)) {
    return buildFailedDraft(cluster, primary, "原文URLが記事ページではない")
  }

  if (!cleanText(primary.bodyText ?? "")) {
    return buildFailedDraft(cluster, primary, "本文が空のため合成不可")
  }

  if (!llm) {
    return buildFallbackDraft(cluster, primary, "LLM未設定、旧方式で暫定生成")
  }

  try {
    // 主軸＋肉付け方式では核(本文最長=primary)を先頭に並べ、プロンプトの「資料1=核」前提と一致させる。
    const orderedCluster = isCoreFirstSynthesisEnabled()
      ? [...evidenceCluster].sort((a, b) => (b.bodyText?.length ?? 0) - (a.bodyText?.length ?? 0))
      : evidenceCluster
    const synthInput: SynthesisSource[] = orderedCluster.map((a) => ({
      source: a.source,
      sourceUrl: a.url,
      publishedAt: a.publishedAt,
      title: a.title,
      bodyText: cleanText(a.bodyText ?? ""),
    }))

    const output = await llm.synthesize({
      cluster: synthInput,
      categoryHint: primary.legacyCategory,
      industryHints: primary.industryHints,
    })

    const minScore = readIndiaRelevanceMin()
    if (output.indiaRelevance.score < minScore) {
      return buildFailedDraft(
        cluster,
        primary,
        `インド関連性が低い (score=${output.indiaRelevance.score}, 閾値=${minScore}): ${output.indiaRelevance.reason}`,
      )
    }

    const minJpScore = readJapaneseBusinessRelevanceMin()
    if (output.japaneseBusinessRelevance.score < minJpScore) {
      return buildFailedDraft(
        cluster,
        primary,
        `日本企業関心度が低い (score=${output.japaneseBusinessRelevance.score}, 閾値=${minJpScore}): ${output.japaneseBusinessRelevance.reason}`,
      )
    }

    let finalOutput = output
    let qualityCheck: QualityCheckMeta | undefined
    let forceReview = false
    if (isQualityCheckEnabled()) {
      const qcResult = await runQualityLoop(llm, output, synthInput, primary)
      finalOutput = qcResult.output
      qualityCheck = qcResult.qualityCheck
      forceReview = qcResult.forceReview
    } else {
      const deterministicQc = runDeterministicQualityGuard(output, synthInput)
      if (deterministicQc) {
        qualityCheck = {
          verdict: deterministicQc.verdict,
          notes: deterministicQc.issues.join("\n"),
          revisionCount: 0,
          checkedAt: new Date().toISOString(),
        }
        forceReview = true
      }
    }

    // Avoid paying for (and storing) a generated image for content which the
    // editorial gate has already held for review.  Remediation can generate an
    // image after the article itself reaches PASS.
    if (!forceReview && (!qualityCheck || qualityCheck.verdict === "PASS")) {
      const imageResult = await tryGenerateImage(
        imageClient,
        finalOutput.imagePrompt,
        primary.title,
      )
      if (imageResult.imageUrl) {
        primary.imageUrl = imageResult.imageUrl
      } else if (imageGenerationRequired()) {
        // A synthesized article is not publication-ready when the configured
        // image stage failed. Persist the concrete reason in the existing
        // quality audit fields so API, timeout, response and Storage failures
        // are distinguishable after the run instead of collapsing to null.
        forceReview = true
        qualityCheck = {
          verdict: "REVISION",
          notes: joinIssueNotes([
            qualityCheck?.notes,
            `画像生成失敗 (${imageResult.attempts}回試行): ${imageResult.error ?? "原因不明"}`,
          ]),
          revisionCount: qualityCheck?.revisionCount ?? 0,
          checkedAt: new Date().toISOString(),
        }
      }
    }

    return buildSynthesizedDraft(evidenceCluster, primary, finalOutput, { qualityCheck, forceReview })
  } catch (error) {
    const msg = error instanceof LLMError
      ? error.message
      : error instanceof Error ? error.message : String(error)
    console.error(`[automation] LLM合成失敗 (title="${primary.title}"): ${msg}`)
    return buildFailedDraft(cluster, primary, `LLM合成失敗: ${msg}`)
  }
}

interface ImageAttemptResult {
  imageUrl?: string
  error?: string
  attempts: number
}

function imageGenerationRequired(): boolean {
  return (process.env.IMAGE_PROVIDER ?? "openai").toLowerCase() !== "none"
}

function readImageGenerationAttempts(): number {
  const raw = Number(process.env.IMAGE_GENERATION_ATTEMPTS)
  if (!Number.isFinite(raw)) return 2
  return Math.max(1, Math.min(3, Math.round(raw)))
}

function compactImageError(error: unknown): string {
  const message = error instanceof ImageGenerationError
    ? error.message
    : error instanceof Error ? error.message : String(error)
  return message.replace(/\s+/g, " ").trim().slice(0, 500) || "原因不明"
}

async function tryGenerateImage(
  imageClient: ImageClient | null,
  prompt: string,
  fallbackTitle: string,
): Promise<ImageAttemptResult> {
  if (!imageClient) {
    return {
      attempts: 0,
      error: imageGenerationRequired()
        ? `画像プロバイダ「${process.env.IMAGE_PROVIDER ?? "openai"}」のクライアントを初期化できませんでした。APIキーとプロバイダ名を確認してください。`
        : undefined,
    }
  }
  const positive = buildSafeImagePrompt(prompt, fallbackTitle)
  if (!positive) {
    return { attempts: 0, error: "安全化後の画像プロンプトが空です" }
  }

  const maxAttempts = readImageGenerationAttempts()
  let lastError = "原因不明"
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await imageClient.generate({ prompt: positive })
      if (!result.imageUrl) throw new ImageGenerationError("画像URLが空です")
      return { imageUrl: result.imageUrl, attempts: attempt }
    } catch (error) {
      lastError = compactImageError(error)
      console.error(
        `[automation] 画像生成失敗 ${attempt}/${maxAttempts} (prompt="${positive.slice(0, 80)}"): ${lastError}`,
      )
    }
  }
  return { attempts: maxAttempts, error: lastError }
}

function urlKey(a: RawSourceArticle): string {
  return (a.canonicalUrl ?? a.url).split("?")[0].replace(/\/+$/, "").toLowerCase()
}

function isPromisingSingleton(article: RawSourceArticle): boolean {
  const t = article.title
  if (!t) return false
  const properNounCount = (t.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) ?? []).length
  const acronymCount = (t.match(/\b[A-Z]{2,}\b/g) ?? []).length
  const hasNumber = /\d/.test(t)
  return properNounCount >= 2 || acronymCount >= 1 || (properNounCount >= 1 && hasNumber)
}

async function augmentSingletonClusters(
  clusters: RawSourceArticle[][],
  alreadyFetched: RawSourceArticle[],
  maxSeeds: number,
): Promise<RawSourceArticle[][]> {
  const excludeUrls = new Set(alreadyFetched.map(urlKey))

  const singletonIndexes: number[] = []
  for (let i = 0; i < clusters.length; i++) {
    if (clusters[i].length === 1 && isPromisingSingleton(clusters[i][0])) {
      singletonIndexes.push(i)
    }
  }
  const seeds = singletonIndexes.slice(0, maxSeeds)
  if (seeds.length === 0) return clusters

  const augmented = clusters.map((c) => [...c])
  await Promise.all(
    seeds.map(async (idx) => {
      const seed = augmented[idx][0]
      const found = await fetchSimilarArticles(seed.title, excludeUrls, 3)
      for (const f of found) {
        const k = urlKey(f)
        if (excludeUrls.has(k)) continue
        // Search results are candidates, not evidence. Re-run the same
        // event-level clustering gate before attaching them to the seed.
        if (
          clusterArticles(
            [seed, f],
            readClusterOptionsFromEnv(),
          ).length !== 1
        ) continue
        excludeUrls.add(k)
        augmented[idx].push(f)
      }
    }),
  )
  return augmented
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = cursor++
      if (index >= items.length) return
      results[index] = await worker(items[index])
    }
  })
  await Promise.all(runners)
  return results
}

// 合成前に薄い本文(RSSのdescriptionが見出し相当のもの)を実記事取得で厚くする。
// これがないと根拠不足で LLM が一般知識を補い、品質チェックで REVISION/REJECT になる。
const THIN_BODY_CHARS = 500

function isThinBody(article: RawSourceArticle): boolean {
  const body = cleanText(article.bodyText ?? "")
  if (body.length < THIN_BODY_CHARS) return true
  const title = cleanText(article.originalTitle ?? article.title ?? "")
  if (title && normalizeSourceTitle(body) === normalizeSourceTitle(title)) return true
  return false
}

// 合成対象に残ったクラスタの薄いソースだけを実取得して本文を差し替える。
// fail-open(失敗・非HTML・抽出不足なら元の本文を維持)かつ全体に時間・件数の上限を設け、
// cron の maxDuration(300s)を脅かさないようにする。FETCH_ARTICLE_BODIES=0 で無効化。
async function enrichClusterBodies(clusters: RawSourceArticle[][]): Promise<number> {
  if (process.env.FETCH_ARTICLE_BODIES === "0") return 0
  const timeoutMs = Number(process.env.BODY_FETCH_TIMEOUT_MS ?? 6_000)
  const phaseBudgetMs = Number(process.env.BODY_FETCH_BUDGET_MS ?? 45_000)
  const maxFetch = Number(process.env.BODY_FETCH_MAX ?? 40)
  const concurrency = Math.max(1, Number(process.env.BODY_FETCH_CONCURRENCY ?? 5))

  const targets: RawSourceArticle[] = []
  const seen = new Set<string>()
  for (const cluster of clusters) {
    for (const article of cluster) {
      if (!isThinBody(article)) continue
      const key = (article.canonicalUrl ?? article.url ?? "").split("?")[0]
      if (!key || seen.has(key)) continue
      seen.add(key)
      targets.push(article)
    }
  }

  const slice = targets.slice(0, Math.max(0, maxFetch))
  if (slice.length === 0) return 0

  const phaseStart = Date.now()
  let enriched = 0
  await mapWithConcurrency(slice, concurrency, async (article) => {
    if (Date.now() - phaseStart > phaseBudgetMs) return

    // Google News のリダイレクトURLは本文抽出できないので、先に実URLへ解決する。
    // 解決できたら表示用の参考リンク(url/canonicalUrl)も実URLに更新する
    // (「参考URLがGoogle Newsリダイレクト」という品質チェック指摘の解消も兼ねる)。
    let targetUrl = article.canonicalUrl ?? article.url
    if (isGoogleNewsArticleUrl(targetUrl)) {
      const resolved = await resolveGoogleNewsUrl(targetUrl, timeoutMs)
      if (resolved) {
        targetUrl = resolved
        article.url = resolved
        article.canonicalUrl = resolved
      }
    }

    const expectedTitle = article.originalTitle ?? article.title
    const fetched = await fetchArticleBody(targetUrl, timeoutMs, expectedTitle)
    if (
      fetched &&
      isUsableArticleBody(fetched, expectedTitle) &&
      fetched.length > cleanText(article.bodyText ?? "").length
    ) {
      article.bodyText = fetched
      article.extractedBy = "article-body-fetch"
      article.fetchedAt = new Date().toISOString()
      article.evidenceSnippets = buildEvidenceSnippets(fetched)
      enriched += 1
    }
  })
  return enriched
}

export async function runAutomationPipeline(
  rawArticles: RawSourceArticle[],
  deps?: {
    llm?: LLMClient | null
    imageClient?: ImageClient | null
    onDraft?: (draft: PipelineDraft) => Promise<void> | void
  },
): Promise<PipelineResult> {
  let llm: LLMClient | null
  if (deps && "llm" in deps) {
    llm = deps.llm ?? null
  } else {
    try {
      llm = getLLMClient()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`[automation] LLMクライアント初期化失敗、fallback経路のみで動作: ${msg}`)
      llm = null
    }
  }

  let imageClient: ImageClient | null
  if (deps && "imageClient" in deps) {
    imageClient = deps.imageClient ?? null
  } else {
    try {
      imageClient = getImageClient()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`[automation] 画像生成クライアント初期化失敗、対象記事を要確認に保留: ${msg}`)
      imageClient = null
    }
  }

  const seen = new Set<string>()
  const seenTitles = new Set<string>()
  const deduped: RawSourceArticle[] = []
  for (const a of rawArticles) {
    const key = (a.canonicalUrl ?? a.url).split("?")[0].replace(/\/+$/, "").toLowerCase()
    const titleKey = normalizeSourceTitle(a.originalTitle ?? a.title)
    if (seen.has(key) || (titleKey && seenTitles.has(titleKey))) continue
    seen.add(key)
    if (titleKey) seenTitles.add(titleKey)
    deduped.push(a)
  }

  const MAX_CLUSTER_SIZE = 5
  const rawClusters = clusterArticles(deduped, readClusterOptionsFromEnv())
  const trimmed = rawClusters.map((c) =>
    c.length > MAX_CLUSTER_SIZE
      ? [...c]
          .sort((a, b) => a.connectorId.localeCompare(b.connectorId))
          .slice(0, MAX_CLUSTER_SIZE)
      : c,
  )

  const enableAugment = process.env.AUGMENT_SINGLETONS !== "0"
  const augmentLimit = Number(process.env.AUGMENT_MAX_SEEDS ?? 8)
  const augmented = enableAugment
    ? await augmentSingletonClusters(trimmed, deduped, augmentLimit)
    : trimmed

  const maxClusters = Number(process.env.MAX_LLM_CLUSTERS ?? 25)
  const jpBoost = Number(process.env.JP_CLUSTER_BOOST ?? 1)
  const priorityWeight = (cluster: RawSourceArticle[]): number => {
    const hasJapanese = cluster.some((a) => CJK_TITLE_REGEX.test(a.title ?? ""))
    return cluster.length + (hasJapanese ? jpBoost : 0)
  }
  const prioritized = [...augmented].sort((a, b) => {
    const aw = priorityWeight(a)
    const bw = priorityWeight(b)
    if (aw !== bw) return bw - aw
    const aDate = Date.parse(a[0]?.publishedAt ?? "") || 0
    const bDate = Date.parse(b[0]?.publishedAt ?? "") || 0
    return bDate - aDate
  })
  const clusters = prioritized.slice(0, maxClusters)
  const droppedClusters = prioritized.slice(maxClusters)

  // 合成対象クラスタの薄い本文を実記事取得で厚くする(パイプライン時間予算の計測前に実行し、
  // 自前のフェーズ予算で上限を持つ)。失敗しても元の本文で従来どおり進む。
  try {
    const enrichedCount = await enrichClusterBodies(clusters)
    if (enrichedCount > 0) {
      console.info(`[automation] 本文実取得で ${enrichedCount} 件のソース本文を補強`)
    }
  } catch (error) {
    console.warn(
      `[automation] 本文実取得フェーズで例外、薄い本文のまま継続: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  const concurrency = Math.max(1, Number(process.env.PIPELINE_CONCURRENCY ?? 2))
  const budgetMs = Number(process.env.PIPELINE_BUDGET_MS ?? 220_000)
  const start = Date.now()
  const onDraft = deps?.onDraft
  const drafts = await mapWithConcurrency(clusters, concurrency, async (cluster) => {
    let draft: PipelineDraft
    if (Date.now() - start > budgetMs) {
      const primary = pickPrimary(cluster)
      draft = buildFailedDraft(cluster, primary, `パイプラインのタイムバジェット超過 (${budgetMs}ms)`)
    } else {
      draft = await buildDraft(cluster, llm, imageClient)
    }
    if (onDraft) {
      try {
        await onDraft(draft)
      } catch (err) {
        console.error(`[automation] onDraft callback failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    return draft
  })

  const result = drafts.reduce<PipelineResult>(
    (acc, draft) => {
      if (draft.workflowStatus === "failed") {
        acc.failed.push(draft)
      } else if (draft.workflowStatus === "review") {
        acc.reviewQueue.push(draft)
      } else {
        acc.published.push(draft)
      }
      return acc
    },
    { published: [], reviewQueue: [], failed: [] },
  )

  for (const cluster of droppedClusters) {
    const primary = pickPrimary(cluster)
    result.failed.push(
      buildFailedDraft(cluster, primary, `クラスタ上限超過 (${maxClusters}件) のため未処理`),
    )
  }

  return result
}
