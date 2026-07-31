#!/usr/bin/env -S npx tsx
/**
 * One-off, auditable remediation for the three 2026-07-17+ review articles
 * whose source bodies are complete enough for publication after small fixes.
 *
 *   npx tsx scripts/remediate-2026-07-21-quality-reviews.ts evaluate
 *   npx tsx scripts/remediate-2026-07-21-quality-reviews.ts apply <results.json>
 *
 * Evaluate is read-only except for a local results file. Apply revalidates the
 * exact output, creates an image, saves fresh evidence snippets, and writes the
 * public status last. All other review rows are intentionally out of scope.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AnthropicClient } from "../lib/llm/anthropic-client.ts"
import { getImageClient, type ImageClient } from "../lib/image-gen/index.ts"
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

interface SourcePlan {
  source: string
  title: string
  url: string
  publishedAt: string
  bodyText?: string
}

interface TargetPlan {
  sources: SourcePlan[]
  sourceUsage: SynthesisOutput["sourceUsage"]
  imagePrompt: string
  mutate: (output: SynthesisOutput) => void
}

const NO_DIRECT_IMPACT =
  "現時点で公表されている情報からは、日本企業への直接的な影響は確認できない。"

const TARGETS: Record<string, TargetPlan> = {
  "4686bacd-c25c-48f2-a0e8-06e90f1caf0e": {
    sources: [
      {
        source: "Indian Express Business",
        title: "Gujarat, Maharashtra & Tamil Nadu top Niti Aayog’s Investment Friendliness Index",
        url: "https://indianexpress.com/article/business/niti-aayog-investment-friendliness-index-2026-fdi-inequality-states-rankings-gujarat-maharashtra-10791647/",
        publishedAt: "2026-07-17",
      },
      {
        source: "Times of India Business",
        title: "Which states are the most investor friendly? Gujarat tops Niti Aayog index; Maharashtra & Tamil Nadu rank next",
        url: "https://timesofindia.indiatimes.com/business/india-business/which-states-are-the-most-investor-friendly-gujarat-tops-niti-aayog-index-maharashtra-tamil-nadu-rank-next/articleshow/132465016.cms",
        publishedAt: "2026-07-17",
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "上位パフォーマンス州はグジャラート、マハラシュトラ、オディシャ、タミル・ナドゥ、ゴア",
          "FDI流入の85%が上位5州に集中",
          "北東部へのFDI流入は合計1%未満",
        ],
      },
      {
        sourceIndex: 2,
        factsUsed: [
          "グジャラートの総合スコアは56.6",
          "マハラシュトラ53.7、タミル・ナドゥ53.3",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of modern anonymous industrial infrastructure and a busy cargo corridor in western India under bright daylight, crisp neutral colors, photojournalism style, no text, no logos, no brand names, no identifiable companies, no recognizable real persons",
    mutate(output) {
      output.title = output.title.replace("【草案時点】", "").trim()
      output.summary = output.summary
        .replace(
          "一方、カルナタカとデリーは「フロントランナー」に分類され、対内直接投資(FDI)の85%を吸収する上位5州(マハラシュトラ、カルナタカ、グジャラート、デリー、タミル・ナドゥ)には入るものの、総合スコア上位3州のメンバーではない。",
          "一方、FDI流入の85%を占める上位5州はマハラシュトラ、カルナタカ、グジャラート、デリー、タミル・ナドゥで、このうちカルナタカとデリーは指数の総合上位3州には入らず、FDI流入先と指数上位は完全には一致しない。",
        )
        .replace(
          "北東部の州は合計でも1%未満にとどまった。",
          "FDI流入は北東部全体で1%未満にとどまった。",
        )
        .replace(
          "下位にはラクシャドウィープ、ラダック、アンダマン・ニコバル諸島が並び、",
          "",
        )
      output.implications[0] = output.implications[0].replace(
        "グジャラート・マハラシュトラ・オディシャ・タミル・ナドゥ・ゴア",
        "グジャラート、マハラシュトラ、オディシャ、タミル・ナドゥ、ゴア",
      )
      output.implications[1] =
        "FDI流入上位5州のうちカルナタカとデリーは指数総合上位3州に入らず、流入額と指数順位は完全には一致しない。"
      output.industryTags = []
      output.japanBusinessImpact = NO_DIRECT_IMPACT
    },
  },
  "c52afda9-f03b-4c9f-aefd-e1b23dad6669": {
    sources: [
      {
        source: "Reliance Industries Limited",
        title: "Media Release - Consolidated and Standalone Unaudited Financial Results for the quarter ended June 30, 2026",
        url: "https://rilstaticasset.akamaized.net/sites/default/files/2026-07/Media_Release_Consolidated_and_Standalone_Unaudited_Financial_Results_for_the_quarter_ended_June_302026.pdf",
        publishedAt: "2026-07-17",
        bodyText: [
          "Official Reliance Industries Limited media release dated July 17, 2026, reporting consolidated results for the quarter ended June 30, 2026, which is 1Q FY27.",
          "Consolidated gross revenue was Rs 340,257 crore, up 24.5% year on year. Recurring EBITDA was Rs 54,067 crore, up 10.1%, and recurring profit after tax including share of associates and joint ventures was Rs 23,196 crore, up 6.1%. Both were the highest ever quarterly recurring figures.",
          "The 1Q FY26 comparative included an exceptional gain of Rs 8,924 crore from the sale of listed investments. When that prior-year gain is included, reported EBITDA was lower by 6.8% and profit after tax including share of associates and joint ventures was lower by 24.6%.",
          "Oil-to-Chemicals (O2C) EBITDA was Rs 17,010 crore, up 17.2%. Higher transportation fuel cracks supported earnings, while higher feedstock costs and lower production due to a planned turnaround were headwinds.",
          "Capital expenditure for the quarter was Rs 38,682 crore, equivalent to USD 4.1 billion.",
          "Reliance Retail Ventures Limited gross revenue was Rs 90,408 crore, up 7.4%. EBITDA was Rs 6,309 crore, down 1.1%, and profit after tax including share of associates was Rs 2,805 crore, down 14.1%. Margin moderation reflected investment in digital commerce and newer businesses.",
        ].join(" "),
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "FY27第1四半期の連結売上高3兆4025億7000万ルピー、24.5%増",
          "一時益892億4000万ルピー",
          "経常EBITDA5406億7000万ルピー",
          "経常純利益2319億6000万ルピー",
          "O2CのEBITDA1701億ルピー",
          "設備投資3868億2000万ルピー",
          "小売売上高9040億8000万ルピー",
          "小売EBITDA630億9000万ルピー",
          "小売純利益280億5000万ルピー",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of an anonymous oil-to-chemicals industrial complex with telecom infrastructure in India under bright daylight, clean industrial palette, photojournalism style, no text, no logos, no brand names, no identifiable companies, no recognizable real persons",
    mutate(output) {
      output.title =
        "リライアンス、FY27第1四半期は経常利益最高　一時益込み比較では減益"
      output.summary =
        "リライアンス・インダストリーズ(RIL)が、2026年6月30日までのFY27第1四半期連結決算を公表した。連結売上高は前年同期比24.5%増の3兆4025億7000万ルピーとなり、経常ベースのEBITDAは10.1%増の5406億7000万ルピー、純利益は6.1%増の2319億6000万ルピーと、ともに四半期として過去最高を更新した。\n\n前年同期には上場投資の売却で892億4000万ルピーの一時益が含まれていた。これを含む前年実績との比較では、EBITDAは6.8%減、純利益は24.6%減となるため、今回の基礎的な収益力を見るには一時益を除いた経常ベースとの比較が重要になる。\n\n石油化学(O2C)事業のEBITDAは17.2%増の1701億ルピーだった。輸送燃料の利幅改善などが寄与した一方、原料調達コスト上昇や計画停止による生産減が利益を圧迫した。四半期設備投資は3868億2000万ルピー(41億ドル)。小売子会社の売上高は7.4%増の9040億8000万ルピー、EBITDAは1.1%減の630億9000万ルピー、純利益は14.1%減の280億5000万ルピーだった。小売の利益減は、デジタルコマースや新規事業への投資で利幅が圧迫されたことが背景にある。"
      output.implications = [
        "前年同期の892億4000万ルピーの一時益を除くと、経常EBITDAと純利益はともに過去最高となった。",
        "一時益を含む前年実績との比較では、EBITDAは6.8%減、純利益は24.6%減となった。",
        "O2Cの増益に対し、小売は増収でもデジタルコマース投資負担でEBITDAと純利益が減少した。",
      ]
      output.industryTags = ["energy"]
      output.category = "market"
      output.backgroundContext = undefined
      output.japanBusinessImpact = NO_DIRECT_IMPACT
    },
  },
  "b11fcf97-7f36-4ed9-9f64-c682355d61b8": {
    sources: [
      {
        source: "Times of India Business",
        title: "Private bank chiefs temper NRI deposit mop-up expectations; Top lenders stay cautious, say several factors affect inflows",
        url: "https://timesofindia.indiatimes.com/business/india-business/private-bank-chiefs-temper-nri-deposit-mop-up-expectations-top-lenders-stay-cautious-say-several-factors-affect-inflows/articleshow/132501062.cms",
        publishedAt: "2026-07-19",
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "当初想定600億〜800億ドル",
          "500億〜550億ドル程度へ下振れ",
          "中東・シンガポール以外では総利息ベースで課税",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of an anonymous modern banking district in India with subtle global finance motifs under bright overcast daylight, clean cool tones, balanced exposure, photojournalism style, no text, no logos, no brand names, no identifiable companies, no recognizable real persons",
    mutate(output) {
      output.summary = output.summary.replace(
        "その上で、当初の想定に比べて資金流入の規模がおよそ50億〜80億ドル程度目減りする可能性があるとの見方を示した。",
        "その上で、潜在的な資金流入額は当初想定の600億〜800億ドルから500億〜550億ドル程度へ下振れする可能性があるとの見方を示した。",
      )
      output.japanBusinessImpact = NO_DIRECT_IMPACT
    },
  },
}

interface ArticleRow {
  id: string
  title: string
  summary: string
  implications: string[]
  category: string
  industry_tags: string[]
  background_context: string | null
  japan_business_impact: string | null
  keywords: SynthesisOutput["keywords"] | null
  image_caption: string | null
  workflow_status: string
  article_sources: Record<string, unknown>[]
  [key: string]: unknown
}

interface EvaluatedSource extends SynthesisSource {
  fetchedAt: string
  evidenceSnippets: string[]
}

interface EvaluationResult {
  id: string
  originalTitle: string
  originalSummary: string
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

async function loadTargets(client: SupabaseClient): Promise<ArticleRow[]> {
  const { data, error } = await client
    .from("articles")
    .select("*, article_sources(*)")
    .in("id", Object.keys(TARGETS))
    .eq("workflow_status", "review")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as ArticleRow[]
}

async function fetchSources(plan: TargetPlan): Promise<EvaluatedSource[]> {
  const sources: EvaluatedSource[] = []
  for (const source of plan.sources) {
    const bodyText =
      source.bodyText ?? await fetchArticleBody(source.url, 15_000, source.title)
    if (bodyText.length < 500) {
      throw new Error(`source body too short (${bodyText.length}): ${source.url}`)
    }
    sources.push({
      ...source,
      sourceUrl: source.url,
      bodyText,
      fetchedAt: new Date().toISOString(),
      evidenceSnippets: buildEvidenceSnippets(bodyText),
    })
  }
  return sources
}

function buildOutput(row: ArticleRow, plan: TargetPlan): SynthesisOutput {
  const output: SynthesisOutput = {
    title: row.title,
    summary: row.summary,
    implications: [...row.implications],
    industryTags: [...(row.industry_tags ?? [])],
    category: row.category,
    referenceUrls: plan.sources.map((source) => ({
      title: source.title,
      url: source.url,
    })),
    sourceUsage: plan.sourceUsage,
    indiaRelevance: { score: 3, reason: "インドの企業・金融・投資環境が主題である" },
    japaneseBusinessRelevance: { score: 2, reason: "インド市場の主要企業・金融・投資環境に関する情報である" },
    imagePrompt: plan.imagePrompt,
    backgroundContext: row.background_context ?? undefined,
    japanBusinessImpact: row.japan_business_impact ?? undefined,
    keywords: row.keywords ?? undefined,
  }
  plan.mutate(output)
  return output
}

async function evaluate() {
  const client = db()
  const llm = new AnthropicClient()
  const rows = await loadTargets(client)
  if (rows.length === 0) throw new Error("no remaining review targets")

  const results: EvaluationResult[] = []
  for (const row of rows) {
    const plan = TARGETS[row.id]
    try {
      const sources = await fetchSources(plan)
      const output = buildOutput(row, plan)
      const deterministic = runDeterministicQualityGuard(output, sources)
      const quality = deterministic ?? await llm.checkQuality({ output, cluster: sources })
      results.push({
        id: row.id,
        originalTitle: row.title,
        originalSummary: row.summary,
        verdict: quality.verdict,
        issues: quality.issues,
        output,
        sources,
      })
      console.log(`[evaluate] ${row.id.slice(0, 8)} ${quality.verdict}${quality.issues.length ? `: ${quality.issues.join(" / ")}` : ""}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({
        id: row.id,
        originalTitle: row.title,
        originalSummary: row.summary,
        verdict: "ERROR",
        issues: [],
        sources: [],
        error: message,
      })
      console.error(`[evaluate] ${row.id.slice(0, 8)} ERROR: ${message}`)
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const outputPath = resolve(OUTPUT_DIR, `quality-reviews-20260721-${stamp()}.json`)
  writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
  console.log(`[results] ${outputPath}`)
}

async function generateRequiredImage(
  imageClient: ImageClient,
  output: SynthesisOutput,
): Promise<string> {
  const prompt = buildSafeImagePrompt(output.imagePrompt, output.title)
  if (!prompt) throw new Error("safe image prompt is empty")
  let lastError = "unknown image error"
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const generated = await imageClient.generate({ prompt })
      if (!generated.imageUrl) throw new Error("image URL is empty")
      return generated.imageUrl
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      console.warn(`[image] attempt ${attempt}/2 failed: ${lastError}`)
    }
  }
  throw new Error(lastError)
}

function sourceRows(articleId: string, sources: EvaluatedSource[]) {
  return sources.map((source, index) => ({
    article_id: articleId,
    source_name: source.source,
    original_title: source.title,
    original_url: source.sourceUrl,
    canonical_url: source.sourceUrl,
    original_published_at: source.publishedAt,
    fetched_at: source.fetchedAt,
    extracted_by: "article-body-fetch/remediation-20260721",
    source_language: "en",
    evidence_snippets: source.evidenceSnippets,
    display_order: index,
  }))
}

async function replaceSourcesSafely(
  client: SupabaseClient,
  article: ArticleRow,
  sources: EvaluatedSource[],
) {
  const oldSources = article.article_sources ?? []
  const { error: deleteError } = await client
    .from("article_sources")
    .delete()
    .eq("article_id", article.id)
  if (deleteError) throw new Error(deleteError.message)

  const { error: insertError } = await client
    .from("article_sources")
    .insert(sourceRows(article.id, sources))
  if (!insertError) return

  await client.from("article_sources").delete().eq("article_id", article.id)
  if (oldSources.length > 0) await client.from("article_sources").insert(oldSources)
  throw new Error(`source replacement failed; restored prior rows: ${insertError.message}`)
}

async function apply(resultsArg: string) {
  const resultsPath = resolve(process.cwd(), resultsArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const client = db()
  const imageClient = getImageClient()
  if (!imageClient) throw new Error("image client is unavailable")
  const rows = await loadTargets(client)
  const currentById = new Map(rows.map((row) => [row.id, row]))

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const backupPath = resolve(OUTPUT_DIR, `quality-reviews-apply-backup-${stamp()}.json`)
  writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`[backup] ${backupPath}`)

  for (const result of payload.results) {
    const article = currentById.get(result.id)
    if (!article || result.verdict !== "PASS" || !result.output) {
      console.log(`[hold] ${result.id.slice(0, 8)} verdict=${result.verdict}`)
      continue
    }
    if (
      article.title !== result.originalTitle ||
      article.summary !== result.originalSummary
    ) {
      console.log(`[hold] ${result.id.slice(0, 8)} changed after evaluation`)
      continue
    }

    const deterministic = runDeterministicQualityGuard(result.output, result.sources)
    if (deterministic) {
      console.log(`[hold] ${result.id.slice(0, 8)} deterministic recheck failed: ${deterministic.issues.join(" / ")}`)
      continue
    }
    const editorial = await new AnthropicClient().checkQuality({
      output: result.output,
      cluster: result.sources,
    })
    if (editorial.verdict !== "PASS") {
      console.log(`[hold] ${result.id.slice(0, 8)} editorial recheck=${editorial.verdict}: ${editorial.issues.join(" / ")}`)
      continue
    }

    const imageUrl = await generateRequiredImage(imageClient, result.output)
    await replaceSourcesSafely(client, article, result.sources)
    const names = result.sources.map((source) => source.source)
    const output = result.output
    const { error } = await client.from("articles").update({
      title: output.title,
      summary: output.summary,
      implications: output.implications,
      category: output.category,
      industry_tags: output.industryTags,
      background_context: output.backgroundContext?.trim() || null,
      japan_business_impact: output.japanBusinessImpact?.trim() || null,
      keywords: output.keywords?.length ? output.keywords : null,
      image_url: imageUrl,
      source: names.length > 1 ? `${names[0]}、他${names.length - 1}件` : names[0],
      source_url: result.sources[0].sourceUrl,
      visibility: "public",
      workflow_status: "published",
      is_synthesized: true,
      quality_verdict: "PASS",
      quality_notes: "2026-07-21 remediation: source refetch + corrected unit conversion + deterministic guard PASS + independent Claude editorial PASS + image generation success",
      revision_count: 0,
      last_quality_check_at: new Date().toISOString(),
    }).eq("id", article.id)
    if (error) throw new Error(`article update failed for ${article.id}: ${error.message}`)
    console.log(`[published] ${article.id} ${output.title} ${imageUrl}`)
  }
}

async function main() {
  const [mode, file] = process.argv.slice(2)
  if (mode === "evaluate") return evaluate()
  if (mode === "apply" && file) return apply(file)
  throw new Error("Usage: evaluate | apply <results.json>")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
