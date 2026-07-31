#!/usr/bin/env -S npx tsx
/**
 * Auditable remediation for deterministic quality-check false positives.
 *
 *   npx tsx scripts/remediate-2026-07-25-quality-false-positives.ts evaluate
 *   npx tsx scripts/remediate-2026-07-25-quality-false-positives.ts apply \
 *     scripts/remediation-backup/quality-false-positives-<timestamp>.json \
 *     <article-id>=<validated-local-image> [...]
 *
 * Evaluation is read-only apart from its ignored local result file. Apply
 * rechecks the same article and freshly fetched source, uploads a visually
 * checked image, and publishes with an optimistic lock as the final DB write.
 * Revise takes an evaluation result and rewrites only rows that received an
 * editorial REVISION, then runs both gates again into a new result file.
 */
import { extname, resolve } from "node:path"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AnthropicClient } from "../lib/llm/anthropic-client.ts"
import { runDeterministicQualityGuard } from "../lib/llm/output-quality-guard.ts"
import type {
  QualityCheckOutput,
  SynthesisOutput,
  SynthesisSource,
} from "../lib/llm/types.ts"
import {
  buildEvidenceSnippets,
  fetchArticleBody,
} from "../lib/scrapers/fetch-india-news.ts"
import { uploadGeneratedImage } from "../lib/supabase/image-storage.ts"

const OUTPUT_DIR = resolve(process.cwd(), "scripts/remediation-backup")

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match || process.env[match[1]] !== undefined) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[match[1]] = value
  }
}

loadEnv()

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase service credentials are not configured")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

interface TargetPlan {
  category?: SynthesisOutput["category"]
  sourceUsage: NonNullable<SynthesisOutput["sourceUsage"]>
}

const TARGETS: Record<string, TargetPlan> = {
  "c14597bf-4b11-4952-ae1f-79659cf2f3e4": {
    category: "economy",
    sourceUsage: [{
      sourceIndex: 1,
      factsUsed: [
        "牧原元法相が7月14日に高速鉄道計画の遅れは100%インド側の責任だと投稿し、インド政府が反発",
        "アーメダバードとムンバイ間の約500キロメートルを約2時間で結ぶ計画",
        "2017年起工、2023年開業予定だったが土地収用の難航で遅延",
        "ビクラム1号が7月18日に打ち上げと軌道投入に成功",
        "宇宙分野への民間参入を2020年に認め、新興企業は400社超",
        "高市首相が2兆円規模の対印投資計画を発表",
      ],
    }],
  },
  "d2c7fcb6-0511-40fa-83b4-4c54e8540a01": {
    sourceUsage: [{
      sourceIndex: 1,
      factsUsed: [
        "ビクラム1号が7月18日に打ち上げと軌道投入に成功し、民間軌道投入の成功国として3番目と報道",
        "宇宙分野への民間参入を2020年に認め、新興企業は400社超",
        "高市首相が2兆円規模の対印投資計画を発表",
        "牧原元法相が14日に高速鉄道計画の遅れは100%インド側の責任だと投稿し、インド政府が反発",
        "高速鉄道は約500キロメートルで、2017年起工、2023年開業予定だったが土地収用の難航で遅延",
      ],
    }],
  },
  "f0271d33-a785-44af-b88f-6581073289a1": {
    sourceUsage: [{
      sourceIndex: 1,
      factsUsed: [
        "2026年3月31日時点で14分野の892件を承認し、投資額は2.40兆ルピー超",
        "生産・販売額22.66兆ルピー超、輸出額15.2兆ルピー超",
        "雇用創出14.15lakh、うち直接雇用8.4lakh",
        "奨励金支給額3,535億4,000万ルピー、承認予算1兆9,100億ルピー",
        "医薬品分野で191種のバルク医薬品を含む1,931製品を国内生産",
      ],
    }],
  },
}

interface SourceRow {
  id: string
  source_name: string | null
  original_title: string
  original_url: string
  canonical_url: string | null
  original_published_at: string | null
  fetched_at: string | null
  extracted_by: string | null
  evidence_snippets: string[]
  display_order: number
}

interface ArticleRow {
  id: string
  title: string
  summary: string
  implications: string[]
  category: SynthesisOutput["category"]
  industry_tags: string[]
  background_context: string | null
  japan_business_impact: string | null
  keywords: SynthesisOutput["keywords"] | null
  image_caption: string | null
  source: string
  source_url: string | null
  published_at: string
  updated_at: string
  quality_verdict: string | null
  revision_count: number
  workflow_status: string
  article_sources: SourceRow[]
}

interface EvaluatedSource extends SynthesisSource {
  rowId: string
  fetchedAt: string
  evidenceSnippets: string[]
}

interface EvaluationResult {
  id: string
  originalTitle: string
  originalSummary: string
  originalUpdatedAt: string
  originalRevisionCount: number
  verdict: QualityCheckOutput["verdict"] | "ERROR"
  issues: string[]
  output?: SynthesisOutput
  sources: EvaluatedSource[]
  error?: string
}

interface ResultsFile {
  generatedAt: string
  results: EvaluationResult[]
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-")
}

async function loadTargets(
  client: SupabaseClient,
  requireReview: boolean,
): Promise<ArticleRow[]> {
  let query = client
    .from("articles")
    .select(`
      id, title, summary, implications, category, industry_tags,
      background_context, japan_business_impact, keywords, image_caption,
      source, source_url, published_at, updated_at, quality_verdict,
      revision_count, workflow_status,
      article_sources (
        id, source_name, original_title, original_url, canonical_url,
        original_published_at, fetched_at, extracted_by, evidence_snippets,
        display_order
      )
    `)
    .in("id", Object.keys(TARGETS))
    .order("created_at", { ascending: true })
  if (requireReview) query = query.eq("workflow_status", "review")

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as ArticleRow[]
}

async function fetchSource(row: ArticleRow): Promise<EvaluatedSource> {
  const source = [...row.article_sources]
    .sort((a, b) => a.display_order - b.display_order)[0]
  if (!source) throw new Error(`article source is missing: ${row.id}`)

  const sourceUrl = source.canonical_url ?? source.original_url
  const bodyText = await fetchArticleBody(
    sourceUrl,
    20_000,
    source.original_title,
  )
  if (bodyText.length < 500) {
    throw new Error(`source body too short (${bodyText.length}): ${sourceUrl}`)
  }
  const fetchedAt = new Date().toISOString()
  return {
    rowId: source.id,
    source: source.source_name ?? row.source,
    sourceUrl,
    publishedAt: (
      source.original_published_at ??
      row.published_at
    ).slice(0, 10),
    title: source.original_title,
    bodyText,
    fetchedAt,
    evidenceSnippets: buildEvidenceSnippets(bodyText),
  }
}

function buildOutput(row: ArticleRow, source: EvaluatedSource): SynthesisOutput {
  const plan = TARGETS[row.id]
  if (!plan) throw new Error(`target plan is missing: ${row.id}`)
  return {
    title: row.title,
    summary: row.summary,
    implications: [...row.implications],
    industryTags: [...row.industry_tags],
    category: plan.category ?? row.category,
    referenceUrls: [{ title: source.title, url: source.sourceUrl }],
    sourceUsage: plan.sourceUsage,
    indiaRelevance: { score: 3, reason: "インドの経済・産業動向が主題である" },
    japaneseBusinessRelevance: {
      score: 2,
      reason: "日本企業がインド市場を判断する材料となる",
    },
    imagePrompt: "validated editorial image supplied during apply",
    backgroundContext: row.background_context ?? undefined,
    japanBusinessImpact: row.japan_business_impact ?? undefined,
    keywords: row.keywords ?? undefined,
  }
}

async function evaluate() {
  const client = db()
  const rows = await loadTargets(client, true)
  if (rows.length !== Object.keys(TARGETS).length) {
    throw new Error(
      `expected ${Object.keys(TARGETS).length} review targets, found ${rows.length}`,
    )
  }

  const llm = new AnthropicClient()
  const results: EvaluationResult[] = []
  for (const row of rows) {
    try {
      const source = await fetchSource(row)
      const output = buildOutput(row, source)
      const deterministic = runDeterministicQualityGuard(output, [source])
      const quality = deterministic ?? await llm.checkQuality({
        output,
        cluster: [source],
      })
      results.push({
        id: row.id,
        originalTitle: row.title,
        originalSummary: row.summary,
        originalUpdatedAt: row.updated_at,
        originalRevisionCount: row.revision_count,
        verdict: quality.verdict,
        issues: quality.issues,
        output,
        sources: [source],
      })
      console.log(
        `[evaluate] ${row.id} ${quality.verdict}` +
        (quality.issues.length ? `: ${quality.issues.join(" / ")}` : ""),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({
        id: row.id,
        originalTitle: row.title,
        originalSummary: row.summary,
        originalUpdatedAt: row.updated_at,
        originalRevisionCount: row.revision_count,
        verdict: "ERROR",
        issues: [],
        sources: [],
        error: message,
      })
      console.error(`[evaluate] ${row.id} ERROR: ${message}`)
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outputPath = resolve(
    OUTPUT_DIR,
    `quality-false-positives-${stamp()}.json`,
  )
  writeFileSync(
    outputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  )
  console.log(`[results] ${outputPath}`)
}

function focusedRevisionInstructions(result: EvaluationResult): string {
  const editorial = result.issues.map((issue) => `- ${issue}`).join("\n")
  if (result.id === "c14597bf-4b11-4952-ae1f-79659cf2f3e4") {
    return `${editorial}
- 記事の主題をムンバイ・アーメダバード高速鉄道の遅延、牧原元法相の投稿、インド政府の反論に絞り、ロケット・宇宙産業・2兆円投資の話題は削除すること。
- 日本の新幹線方式を採用した計画であること、約500キロメートル・約2時間、2017年起工、当初2023年開業予定、土地収用の難航を、原文表現をなぞらず出来事→計画概要→遅延要因の順に独自に再構成すること。
- 牧原氏の侮蔑的な一般化は引用せず、責任論が対立しているという事実だけを中立的に書くこと。
- category は economy、industryTags は logistics を維持すること。`
  }
  if (result.id === "d2c7fcb6-0511-40fa-83b4-4c54e8540a01") {
    return `${editorial}
- 記事の主題を、民間ロケットの軌道投入成功と日印高速鉄道の責任論という二つの対照的な出来事に限定すること。
- 冒頭で二つの出来事を簡潔に示し、その後に宇宙分野の事実、高速鉄道の事実、日印経済関係を見る際の意味の順で独自に再構成すること。原文の段落順を踏襲しないこと。
- 高速鉄道が日本の新幹線方式を採用する計画であることを明記し、雇用情勢・政党・侮蔑的な表現など主題に不要な論点は入れないこと。
- 固有の事実間に原文が述べていない因果関係を作らず、並行して起きた対照的な事象として扱うこと。
- category は economy、industryTags は logistics を維持すること。`
  }
  return editorial
}

function normalizeRemediatedOutput(
  id: string,
  output: SynthesisOutput,
): SynthesisOutput {
  const normalized: SynthesisOutput = {
    ...output,
    implications: [...output.implications],
  }
  if (id === "c14597bf-4b11-4952-ae1f-79659cf2f3e4") {
    normalized.implications[0] =
      "牧原元法相はインド高速鉄道の遅れを全面的にインド側の責任だと投稿し、インド政府は事実と異なるとして正式に反論した。"
  }
  if (id === "d2c7fcb6-0511-40fa-83b4-4c54e8540a01") {
    normalized.title =
      "インド民間企業が初の軌道投入成功、高速鉄道遅延では日印摩擦"
  }
  return normalized
}

async function revise(resultsArg: string) {
  const resultsPath = resolve(process.cwd(), resultsArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const llm = new AnthropicClient()
  const revisedResults: EvaluationResult[] = []

  for (const result of payload.results) {
    if (
      result.verdict !== "REVISION" ||
      !result.output ||
      result.sources.length === 0
    ) {
      revisedResults.push(result)
      continue
    }

    try {
      const plan = TARGETS[result.id]
      let output = await llm.reviseSynthesis({
        cluster: result.sources,
        previousOutput: result.output,
        revisionInstructions: focusedRevisionInstructions(result),
        categoryHint: plan.category ?? result.output.category,
        industryHints: result.output.industryTags,
      })
      output = normalizeRemediatedOutput(result.id, {
        ...output,
        category: plan.category ?? output.category,
        industryTags: result.output.industryTags,
      })
      if (result.id === "d2c7fcb6-0511-40fa-83b4-4c54e8540a01") {
        output.summary =
          `${output.summary}インド政府は、日印間の協議は順調に進んでいるとも説明している。`
      }
      const deterministic = runDeterministicQualityGuard(
        output,
        result.sources,
      )
      const quality = deterministic ?? await llm.checkQuality({
        output,
        cluster: result.sources,
      })
      revisedResults.push({
        ...result,
        verdict: quality.verdict,
        issues: quality.issues,
        output,
        error: undefined,
      })
      console.log(
        `[revise] ${result.id} ${quality.verdict}` +
        (quality.issues.length ? `: ${quality.issues.join(" / ")}` : ""),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      revisedResults.push({ ...result, verdict: "ERROR", error: message })
      console.error(`[revise] ${result.id} ERROR: ${message}`)
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outputPath = resolve(
    OUTPUT_DIR,
    `quality-false-positives-revised-${stamp()}.json`,
  )
  writeFileSync(
    outputPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      results: revisedResults,
    }, null, 2),
  )
  console.log(`[results] ${outputPath}`)
}

async function recheck(resultsArg: string) {
  const resultsPath = resolve(process.cwd(), resultsArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const llm = new AnthropicClient()
  const checkedResults: EvaluationResult[] = []

  for (const result of payload.results) {
    if (!result.output || result.sources.length === 0) {
      checkedResults.push(result)
      continue
    }
    try {
      const output = normalizeRemediatedOutput(result.id, result.output)
      const deterministic = runDeterministicQualityGuard(
        output,
        result.sources,
      )
      const quality = deterministic ?? await llm.checkQuality({
        output,
        cluster: result.sources,
      })
      checkedResults.push({
        ...result,
        verdict: quality.verdict,
        issues: quality.issues,
        output,
        error: undefined,
      })
      console.log(
        `[recheck] ${result.id} ${quality.verdict}` +
        (quality.issues.length ? `: ${quality.issues.join(" / ")}` : ""),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      checkedResults.push({ ...result, verdict: "ERROR", error: message })
      console.error(`[recheck] ${result.id} ERROR: ${message}`)
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outputPath = resolve(
    OUTPUT_DIR,
    `quality-false-positives-rechecked-${stamp()}.json`,
  )
  writeFileSync(
    outputPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      results: checkedResults,
    }, null, 2),
  )
  console.log(`[results] ${outputPath}`)
}

function parseImageArgs(args: string[]): Map<string, string> {
  const result = new Map<string, string>()
  for (const arg of args) {
    const separator = arg.indexOf("=")
    if (separator <= 0) throw new Error(`invalid image mapping: ${arg}`)
    result.set(
      arg.slice(0, separator),
      resolve(process.cwd(), arg.slice(separator + 1)),
    )
  }
  return result
}

async function uploadCheckedImage(path: string) {
  const extension = extname(path).toLowerCase()
  const type = extension === ".png"
    ? { contentType: "image/png", extension: "png" }
    : extension === ".webp"
      ? { contentType: "image/webp", extension: "webp" }
      : extension === ".jpg" || extension === ".jpeg"
        ? { contentType: "image/jpeg", extension: "jpg" }
        : null
  if (!type) throw new Error(`unsupported image extension: ${extension}`)
  const body = readFileSync(path)
  if (body.byteLength < 10_000) {
    throw new Error(`image file is unexpectedly small: ${path}`)
  }
  return uploadGeneratedImage(body, type)
}

async function apply(resultsArg: string, imageArgs: string[]) {
  const resultsPath = resolve(process.cwd(), resultsArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const imagePaths = parseImageArgs(imageArgs)
  const client = db()
  const rows = await loadTargets(client, true)
  const currentById = new Map(rows.map((row) => [row.id, row]))
  const llm = new AnthropicClient()

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const backupPath = resolve(
    OUTPUT_DIR,
    `quality-false-positives-apply-backup-${stamp()}.json`,
  )
  writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`[backup] ${backupPath}`)

  for (const result of payload.results) {
    const current = currentById.get(result.id)
    const imagePath = imagePaths.get(result.id)
    if (
      !current ||
      !imagePath ||
      result.verdict !== "PASS" ||
      !result.output ||
      result.sources.length !== 1
    ) {
      console.log(`[hold] ${result.id} is not apply-ready`)
      continue
    }
    if (
      current.title !== result.originalTitle ||
      current.summary !== result.originalSummary ||
      current.updated_at !== result.originalUpdatedAt ||
      current.quality_verdict !== "REVISION"
    ) {
      console.log(`[hold] ${result.id} changed after evaluation`)
      continue
    }

    // Re-fetch at apply time as well. Evaluation result files are auditable
    // snapshots, but must not authorize publication if the publisher changed
    // or replaced the source between evaluate/recheck and apply.
    const source = await fetchSource(current)
    const deterministic = runDeterministicQualityGuard(result.output, [source])
    if (deterministic) {
      console.log(
        `[hold] ${result.id} deterministic recheck failed: ` +
        deterministic.issues.join(" / "),
      )
      continue
    }
    const editorial = await llm.checkQuality({
      output: result.output,
      cluster: [source],
    })
    if (editorial.verdict !== "PASS") {
      console.log(
        `[hold] ${result.id} editorial recheck=${editorial.verdict}: ` +
        editorial.issues.join(" / "),
      )
      continue
    }

    // Upload first so a Storage failure cannot leave source audit metadata
    // updated on an article that remains in review.
    const uploaded = await uploadCheckedImage(imagePath)
    const priorSource = current.article_sources.find(
      (candidate) => candidate.id === source.rowId,
    )
    if (!priorSource) {
      const bucket = process.env.SUPABASE_IMAGE_BUCKET ?? "article-images"
      await client.storage.from(bucket).remove([uploaded.path])
      throw new Error(`current source row is missing: ${source.rowId}`)
    }

    const { data: sourceData, error: sourceError } = await client
      .from("article_sources")
      .update({
        fetched_at: source.fetchedAt,
        extracted_by: "article-body-fetch/remediation-20260725",
        evidence_snippets: source.evidenceSnippets,
      })
      .eq("id", source.rowId)
      .eq("article_id", result.id)
      .select("id")
      .maybeSingle()
    if (sourceError || !sourceData) {
      const bucket = process.env.SUPABASE_IMAGE_BUCKET ?? "article-images"
      await client.storage.from(bucket).remove([uploaded.path])
      console.log(
        `[hold] ${result.id} source update failed: ` +
        (sourceError?.message ?? "source row did not match"),
      )
      continue
    }

    const output = result.output
    const checkedAt = new Date().toISOString()
    const { data, error } = await client
      .from("articles")
      .update({
        title: output.title,
        summary: output.summary,
        implications: output.implications,
        category: output.category,
        industry_tags: output.industryTags,
        background_context: output.backgroundContext?.trim() || null,
        japan_business_impact: output.japanBusinessImpact?.trim() || null,
        keywords: output.keywords?.length ? output.keywords : null,
        image_url: uploaded.publicUrl,
        visibility: "public",
        workflow_status: "published",
        quality_verdict: "PASS",
        quality_notes:
          "2026-07-25 remediation: deterministic false positive corrected; fresh source fetch + deterministic guard PASS + independent Claude editorial PASS + visually checked image upload",
        revision_count: result.originalRevisionCount,
        last_quality_check_at: checkedAt,
      })
      .eq("id", result.id)
      .eq("updated_at", result.originalUpdatedAt)
      .eq("workflow_status", "review")
      .select("id, workflow_status, visibility, quality_verdict, image_url")
      .maybeSingle()
    if (error || !data) {
      const bucket = process.env.SUPABASE_IMAGE_BUCKET ?? "article-images"
      const { error: restoreError } = await client
        .from("article_sources")
        .update({
          fetched_at: priorSource.fetched_at,
          extracted_by: priorSource.extracted_by,
          evidence_snippets: priorSource.evidence_snippets,
        })
        .eq("id", priorSource.id)
        .eq("article_id", result.id)
      const { error: removeError } = await client.storage
        .from(bucket)
        .remove([uploaded.path])
      throw new Error(
        `article update failed for ${result.id}; recovery source=${restoreError?.message ?? "restored"} image=${removeError?.message ?? "removed"}: ` +
        (error?.message ?? "optimistic lock did not match"),
      )
    }
    console.log(`[published] ${result.id} ${uploaded.publicUrl}`)
  }
}

async function main() {
  const [mode, file, ...imageArgs] = process.argv.slice(2)
  if (mode === "evaluate") return evaluate()
  if (mode === "revise" && file) return revise(file)
  if (mode === "recheck" && file) return recheck(file)
  if (mode === "apply" && file) return apply(file, imageArgs)
  throw new Error(
    "Usage: evaluate | revise <results.json> | recheck <results.json> | apply <results.json> <article-id>=<image-path> [...]",
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
