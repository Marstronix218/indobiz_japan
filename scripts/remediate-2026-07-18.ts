#!/usr/bin/env -S npx tsx
/**
 * 2026-07-18 の review 記事のうち、ソース本文が健全な2本を再合成して公開する。
 *
 *   npx tsx scripts/remediate-2026-07-18.ts
 *
 * 元の不合格理由は「クラスタ内に同一記事が重複計上され、修正再生成では
 * 直せない指摘が繰り返されて REVISION 上限に到達」だったため、重複のない
 * 単一ソースで本文を再取得し、合成→品質ループ→PASS の場合のみ画像を生成
 * して公開する。PASS しなければ記事は一切変更せず review のまま残す。
 * (ジェトロ名古屋記事 b49b51aa はソースが会員限定抜粋のため対象外 = review 維持)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AnthropicClient } from "../lib/llm/anthropic-client.ts"
import { getImageClient } from "../lib/image-gen/index.ts"
import { buildSafeImagePrompt } from "../lib/image-gen/safe-prompt.ts"
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

const OUTPUT_DIR = resolve(process.cwd(), "scripts/remediation-backup")
const MAX_REVISIONS = 3
const RELEVANCE_MIN = 2

// 対象記事と、その記事の実ソース(重複計上を除いた正規URL)。
const TARGETS: Record<string, { source: string; title: string; url: string; publishedAt: string; extraInstructions?: string }> = {
  "2d6f69ba-60f3-43b3-8062-c2102dd5cc31": {
    source: "Times of India Business",
    title: "Making waves underground: India's first undersea rail tunnel takes shape",
    url: "https://timesofindia.indiatimes.com/business/india-business/making-waves-underground-indias-first-undersea-rail-tunnel-takes-shape/articleshow/132483064.cms",
    publishedAt: "2026-07-18",
    extraInstructions:
      "industryTags は、鉄道インフラ・トンネル建設が許可タグ11種に該当しなければ空配列にすること(logistics を安易に付けない)。",
  },
  "e7d2aa02-4d1e-4024-912e-cba7477b7e79": {
    source: "Times of India Business",
    title: "ITR filing: Sold shares, property or crypto this year? Here's what you must know before filing your income tax return",
    url: "https://timesofindia.indiatimes.com/business/india-business/itr-filing-sold-shares-property-or-crypto-this-year-heres-what-you-must-know-before-filing-your-income-tax-return/articleshow/132477796.cms",
    publishedAt: "2026-07-18",
    extraInstructions:
      "原文の列挙(誤りやすい項目リスト)の順序・構成をなぞらず、テーマ別に再構成した独自の段落構成で書くこと。事実(数値・制度名・条文)は原文に忠実に保つこと。",
  },
}

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match || process.env[match[1]] !== undefined) continue
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1)
    process.env[match[1]] = value
  }
}

loadEnv()

function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase service credentials are not configured")
  return createClient(url, key, { auth: { persistSession: false } })
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-")
}

interface EvaluatedSource extends SynthesisSource {
  fetchedAt: string
  evidenceSnippets: string[]
}

async function fetchSource(articleId: string): Promise<EvaluatedSource | null> {
  const plan = TARGETS[articleId]
  const bodyText = await fetchArticleBody(plan.url, 15_000, plan.title)
  console.log(`[source] ${articleId.slice(0, 8)} ${plan.source}: ${bodyText.length} chars`)
  if (!bodyText) return null
  return {
    source: plan.source,
    sourceUrl: plan.url,
    publishedAt: plan.publishedAt,
    title: plan.title,
    bodyText,
    fetchedAt: new Date().toISOString(),
    evidenceSnippets: buildEvidenceSnippets(bodyText),
  }
}

async function qualityLoop(
  llm: AnthropicClient,
  initial: SynthesisOutput,
  sources: EvaluatedSource[],
  category: string,
  extraInstructions?: string,
): Promise<{ output: SynthesisOutput; verdict: string; issues: string[]; revisions: number }> {
  let output = initial
  let revisions = 0

  for (let attempt = 0; attempt <= MAX_REVISIONS; attempt++) {
    let qc: QualityCheckOutput
    const deterministic = runDeterministicQualityGuard(output, sources)
    if (deterministic) {
      qc = deterministic
    } else {
      qc = await llm.checkQuality({ output, cluster: sources })
    }
    console.log(`[quality] attempt=${attempt} verdict=${qc.verdict}${qc.issues.length ? ` issues=${qc.issues.join(" / ").slice(0, 200)}` : ""}`)

    if (qc.verdict === "PASS") return { output, verdict: "PASS", issues: [], revisions }
    if (qc.verdict === "REJECT" || !qc.revisionInstructions || attempt >= MAX_REVISIONS) {
      return { output, verdict: qc.verdict, issues: qc.issues, revisions }
    }

    output = await llm.reviseSynthesis({
      cluster: sources,
      previousOutput: output,
      revisionInstructions: [qc.revisionInstructions, extraInstructions]
        .filter(Boolean)
        .join("\n"),
      categoryHint: category,
    })
    revisions += 1
  }
  return { output, verdict: "REVISION", issues: ["修正回数の上限に達した"], revisions }
}

async function generateImage(output: SynthesisOutput, fallbackTitle: string): Promise<string> {
  const imageClient = getImageClient()
  if (!imageClient) throw new Error("image client unavailable")
  const prompt = buildSafeImagePrompt(output.imagePrompt, fallbackTitle)
  if (!prompt) throw new Error("safe image prompt is empty")
  let lastError = "unknown image error"
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const generated = await imageClient.generate({ prompt })
      if (!generated.imageUrl) throw new Error("image provider returned an empty URL")
      console.log(`[image] generated attempt=${attempt} model=${generated.model}`)
      return generated.imageUrl
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      console.warn(`[image] attempt ${attempt}/2 failed: ${lastError.replace(/\s+/g, " ").slice(0, 300)}`)
    }
  }
  throw new Error(lastError)
}

async function main() {
  const client = db()
  const { data: rows, error } = await client
    .from("articles")
    .select("*, article_sources(*)")
    .in("id", Object.keys(TARGETS))
    .eq("workflow_status", "review")
  if (error) throw new Error(error.message)
  if (!rows || rows.length === 0) throw new Error("no review targets found")

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const backupPath = resolve(OUTPUT_DIR, `backup-20260718-${stamp()}.json`)
  writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`[backup] ${backupPath}`)

  const llm = new AnthropicClient()
  const summary: Record<string, string> = {}

  for (const article of rows) {
    const id = article.id as string
    const plan = TARGETS[id]
    console.log(`\n=== ${id} ${article.title} ===`)

    const source = await fetchSource(id)
    if (!source) {
      summary[id] = "SKIP: ソース本文を取得できず (review のまま)"
      continue
    }

    let output: SynthesisOutput
    try {
      output = await llm.synthesize({
        cluster: [source],
        categoryHint: article.category,
      })
    } catch (err) {
      summary[id] = `SKIP: 合成失敗 (${err instanceof Error ? err.message : String(err)})`
      continue
    }

    if (output.indiaRelevance.score < RELEVANCE_MIN ||
        output.japaneseBusinessRelevance.score < RELEVANCE_MIN) {
      summary[id] = `SKIP: 関連性ゲート不通過 (india=${output.indiaRelevance.score}, jp=${output.japaneseBusinessRelevance.score})`
      continue
    }

    const result = await qualityLoop(llm, output, [source], article.category, plan.extraInstructions)
    if (result.verdict !== "PASS") {
      summary[id] = `HOLD: ${result.verdict} after ${result.revisions} revisions — ${result.issues.join(" / ").slice(0, 300)} (review のまま)`
      continue
    }

    let imageUrl: string
    try {
      imageUrl = await generateImage(result.output, article.title as string)
    } catch (err) {
      summary[id] = `HOLD: PASS したが画像生成に失敗 (${err instanceof Error ? err.message : String(err)}) (review のまま)`
      continue
    }

    const final = result.output
    // 公開前にソース行を差し替え(公開ステータスは最後に書く)。
    const { error: delError } = await client
      .from("article_sources").delete().eq("article_id", id)
    if (delError) {
      summary[id] = `ERROR: source delete failed: ${delError.message}`
      continue
    }
    const { error: insError } = await client.from("article_sources").insert([{
      article_id: id,
      source_name: source.source,
      original_title: source.title,
      original_url: source.sourceUrl,
      canonical_url: source.sourceUrl,
      original_published_at: source.publishedAt,
      fetched_at: source.fetchedAt,
      extracted_by: "article-body-fetch/remediation-20260718",
      source_language: "en",
      evidence_snippets: source.evidenceSnippets,
      display_order: 0,
    }])
    if (insError) {
      summary[id] = `ERROR: source insert failed: ${insError.message}`
      continue
    }

    const { error: upError } = await client.from("articles").update({
      title: final.title,
      summary: final.summary.trim(),
      implications: final.implications,
      category: final.category || article.category,
      industry_tags: final.industryTags,
      background_context: final.backgroundContext?.trim() || null,
      japan_business_impact: final.japanBusinessImpact?.trim() || null,
      keywords: final.keywords?.length ? final.keywords : null,
      image_url: imageUrl,
      source: source.source,
      source_url: source.sourceUrl,
      visibility: "public",
      workflow_status: "published",
      is_synthesized: true,
      quality_verdict: "PASS",
      quality_notes:
        "2026-07-18 remediation: 重複ソースを正規URL1件に統合し本文を再取得、再合成が品質チェックPASS、画像生成成功",
      revision_count: result.revisions,
      last_quality_check_at: new Date().toISOString(),
    }).eq("id", id)
    if (upError) {
      summary[id] = `ERROR: article update failed: ${upError.message}`
      continue
    }
    summary[id] = `PUBLISHED: 「${final.title}」 revisions=${result.revisions}`
  }

  console.log("\n=== RESULT ===")
  for (const [id, line] of Object.entries(summary)) {
    console.log(`${id.slice(0, 8)}: ${line}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
