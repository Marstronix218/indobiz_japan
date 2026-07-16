#!/usr/bin/env -S npx tsx
/**
 * Rebuild review articles from fresh source bodies and publish only articles
 * which pass both the deterministic evidence guard and Claude's editorial
 * check.
 *
 *   npx tsx scripts/remediate-review-articles.ts evaluate
 *   npx tsx scripts/remediate-review-articles.ts apply <results.json>
 *
 * evaluate is read-only apart from local backup/results artifacts. apply is
 * deliberately separate, revalidates every stored output, and mutates one
 * article at a time while it is still non-public. The public status is written
 * last, after its source rows have been replaced successfully.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AnthropicClient } from "../lib/llm/anthropic-client.ts"
import { runDeterministicQualityGuard } from "../lib/llm/output-quality-guard.ts"
import { normalizeSourceTitle, normalizeSourceUrl } from "../lib/llm/source-policy.ts"
import type {
  QualityCheckOutput,
  SynthesisOutput,
  SynthesisSource,
} from "../lib/llm/types.ts"
import {
  buildEvidenceSnippets,
  fetchArticleBody,
} from "../lib/scrapers/fetch-india-news.ts"

const SINCE = "2026-07-09T00:00:00Z"
const OUTPUT_DIR = resolve(process.cwd(), "scripts/remediation-backup")
const MAX_REVISIONS = 2
const MAX_RESCUE_REVISIONS = 3

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

interface PlannedSource {
  source: string
  title: string
  url: string
  publishedAt: string
}

// Curated after an independent two-reviewer audit. Unrelated sources are
// intentionally omitted; primary/official sources are preferred where they
// exist. Keeping this explicit also makes this one-off production mutation
// reviewable and reproducible.
const SOURCE_PLANS: Record<string, PlannedSource[]> = {
  "5ceba47f-5e3a-4322-9130-69121488b5fc": [
    {
      source: "近畿経済産業局",
      title: "インド・関西ビジネスフォーラム（IKBF）設立記念シンポジウム",
      url: "https://www.kansai.meti.go.jp/2kokuji/glocal_PT/india/IKBF_R8FY_event.html",
      publishedAt: "2026-07-09",
    },
    {
      source: "J-Net21",
      title: "インド・関西ビジネスフォーラム設立記念シンポジウム開催へ",
      url: "https://j-net21.smrj.go.jp/news/bt5puv000000nqm9.html",
      publishedAt: "2026-07-09",
    },
  ],
  "a457aca0-da73-40ce-ab3d-c5582bda16eb": [
    {
      source: "Tata Consultancy Services",
      title: "TCS Financial Results Q1 FY 2027",
      url: "https://www.tcs.com/who-we-are/newsroom/press-release/tcs-financial-results-q1-fy-2027",
      publishedAt: "2026-07-09",
    },
    {
      source: "Times of India",
      title: "TCS Q1 FY27 results: Tata Consultancy Services reports 5% y-o-y increase in net profit to Rs 13,349 crore",
      url: "https://timesofindia.indiatimes.com/business/india-business/tcs-q1-fy27-results-tata-consultancy-services-quarterly-earnings-profit-after-tax-revenue-key-highlights/articleshow/132283960.cms",
      publishedAt: "2026-07-09",
    },
  ],
  "49a47a1e-9de4-44af-a92a-d2c68e270a89": [
    {
      source: "The Hindu",
      title: "RBI launches 3 key surveys to get input for monetary policy",
      url: "https://www.thehindu.com/business/Economy/rbi-launches-3-key-surveys-to-get-input-for-monetary-policy/article71202495.ece",
      publishedAt: "2026-07-09",
    },
    {
      source: "GK Today",
      title: "RBI Launches Three Key Surveys for Monetary Policy Inputs",
      url: "https://www.gktoday.in/rbi-launches-three-key-surveys-for-monetary-policy-inputs/",
      publishedAt: "2026-07-09",
    },
  ],
  "e81c5616-7f77-4224-a21b-5675e45277eb": [
    {
      source: "Nifty Indices",
      title: "Nifty500 Ahimsa",
      url: "https://www.niftyindices.com/indices/equity/thematic-indices/nifty500-ahimsa",
      publishedAt: "2026-07-11",
    },
    {
      source: "ANI News",
      title: "NSE Indices launches Nifty500 Ahimsa Index to track companies aligned with non-violence principles",
      url: "https://www.aninews.in/news/business/nse-indices-launches-nifty500-ahimsa-index-to-track-companies-aligned-with-non-violence-principles20260711104203",
      publishedAt: "2026-07-11",
    },
  ],
  "e591c312-55f1-4f15-9688-0a400da45c50": [
    {
      source: "Times of India",
      title: "India-UK FTA opens doors, but tariff cuts alone won't lift exports: GTRI",
      url: "https://timesofindia.indiatimes.com/business/india-business/india-uk-fta-opens-doors-but-tariff-cuts-alone-wont-lift-exports-gtri/articleshow/132346520.cms",
      publishedAt: "2026-07-15",
    },
    {
      source: "UK Government",
      title: "The countdown begins: UK-India FTA enters into force on July 15th",
      url: "https://www.gov.uk/government/news/the-countdown-begins-uk-india-fta-enters-into-force-on-july-15th",
      publishedAt: "2026-07-15",
    },
    {
      source: "UK Government",
      title: "UK-India trade deal: agreement and explanatory documents",
      url: "https://www.gov.uk/government/collections/uk-india-trade-deal",
      publishedAt: "2026-07-15",
    },
  ],
  "91dce608-8c04-49b4-a468-a282124e8b3f": [
    {
      source: "Press Information Bureau",
      title: "Retail inflation based on Consumer Price Index in June 2026 is 4.38%",
      url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2284125&lang=2&reg=48",
      publishedAt: "2026-07-13",
    },
    {
      source: "Rediff",
      title: "Retail Inflation Rises to 4.38% in June, Exceeds RBI's 4% Median Target",
      url: "https://www.rediff.com/business/report/india-retail-inflation-jumps-to-438-in-june-above-rbi-target-experts-weigh-in/20260713.htm",
      publishedAt: "2026-07-13",
    },
  ],
  "ba78609a-87a8-472b-98a0-6c01482df0a7": [
    {
      source: "Press Information Bureau",
      title: "Cabinet approves Mobile Phone Manufacturing Scheme with an outlay of Rs 62,500 crore",
      url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2284789&lang=2&reg=48",
      publishedAt: "2026-07-15",
    },
    {
      source: "Telangana Today",
      title: "Cabinet clears Rs 62,500-crore Mobile Phone Manufacturing Scheme to boost domestic R&D",
      url: "https://telanganatoday.com/cabinet-clears-rs-62500-crore-mobile-phone-manufacturing-scheme-to-boost-domestic-rd",
      publishedAt: "2026-07-15",
    },
  ],
  "9c32dfe1-fa39-4e90-9592-16d881ffdf1f": [
    {
      source: "The Hindu",
      title: "RBI issues draft data governance guidance framework for banks",
      url: "https://www.thehindu.com/business/Economy/rbi-issues-data-governance-guidance-framework-for-banks-to-strengthen-data-quality-security-and-accountability/article71226068.ece",
      publishedAt: "2026-07-15",
    },
    {
      source: "Business Standard",
      title: "RBI issues draft data governance norms for banks and NBFCs",
      url: "https://www.business-standard.com/finance/news/rbi-issues-draft-data-governance-norms-for-banks-nbfcs-126071501296_1.html",
      publishedAt: "2026-07-15",
    },
  ],
}

interface ArticleRow {
  id: string
  title: string
  summary: string
  published_at: string
  category: string
  industry_tags: string[]
  workflow_status: string
  visibility: string
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
  verdict: "PASS" | "REVISION" | "REJECT" | "ERROR"
  issues: string[]
  revisions: number
  output?: SynthesisOutput
  sources: EvaluatedSource[]
  error?: string
}

interface ResultsFile {
  generatedAt: string
  since: string
  backupPath: string
  results: EvaluationResult[]
}

const RESCUE_INSTRUCTIONS: Record<string, string> = {
  "5ceba47f-5e3a-4322-9130-69121488b5fc":
    "申込期限・満席・募集締切の状態は更新時点が混在するため本文・ポイント・背景からすべて削除すること。IKBFの設立、参画機関、開催内容、企業事例という時点に依存しない確認済み事実で構成すること。",
  "a457aca0-da73-40ce-ab3d-c5582bda16eb":
    "単位換算を全面修正すること。Rs 13,349 croreは1,334.9億ルピー（約1,335億ルピー）、Rs 12,760 croreは1,276億ルピー、Rs 72,275 croreは7,227.5億ルピーであり、133億・127億・722億ではない。reported純利益と例外項目除外後の指標を混同しないこと。入力本文の4,000字以降にしかない可能性がある数値は使わないこと。",
  "49a47a1e-9de4-44af-a92a-d2c68e270a89":
    "『利上げ』『利下げ』など政策方向を予測せず、3調査が金融政策判断の材料になるという中立的な事実だけを書くこと。",
  "e81c5616-7f77-4224-a21b-5675e45277eb":
    "Nifty Indices公式資料を主軸にし、ANIの文順を踏襲しないこと。ポイントで使うグリーン・オレンジ・レッド等の分類はsummaryで先に説明すること。半導体が明記されない限りsemiconductorタグを付けないこと。",
  "e591c312-55f1-4f15-9688-0a400da45c50":
    "UK Governmentのコレクション資料に『entered into force on 15 July 2026』と明記されているため、7月15日に発効した現在状態を同資料で裏付けること。将来予定だけの資料と混同しないこと。",
  "91dce608-8c04-49b4-a468-a282124e8b3f":
    "PIB一次資料を6月CPI・食品インフレの根拠として使い、Rediffを前月比較・RBI見通し等の補強に使うこと。金利方向や日本企業の人件費への波及を断定せず、直接影響が確認できない場合はその旨を書くこと。",
  "ba78609a-87a8-472b-98a0-6c01482df0a7":
    "PIB一次資料を主軸にすること。Rs 62,500 croreは6,250億ルピー、Rs 39 lakh croreは39兆ルピー、60,000 jobsは6万人として換算する。半導体への直接言及がなければsemiconductorタグを削除すること。",
  "9c32dfe1-fa39-4e90-9592-16d881ffdf1f":
    "summaryを700字以内に圧縮すること。タイトルとsummaryの両方で草案・意見募集段階と明記し、shall/mustを現行義務として書かないこと。日本企業への影響も『草案が確定した場合』という条件付きにすること。",
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-")
}

async function loadTargets(client: SupabaseClient): Promise<ArticleRow[]> {
  const { data, error } = await client
    .from("articles")
    .select("*, article_sources(*)")
    .gte("created_at", SINCE)
    .neq("workflow_status", "published")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as ArticleRow[]
}

async function fetchPlannedSources(articleId: string): Promise<EvaluatedSource[]> {
  const plan = SOURCE_PLANS[articleId] ?? []
  const results: EvaluatedSource[] = []
  for (const source of plan) {
    const bodyText = await fetchArticleBody(source.url, 15_000, source.title)
    console.log(`[source] ${articleId.slice(0, 8)} ${source.source}: ${bodyText.length} chars`)
    if (!bodyText) continue
    const fetchedAt = new Date().toISOString()
    results.push({
      source: source.source,
      sourceUrl: source.url,
      publishedAt: source.publishedAt,
      title: source.title,
      bodyText,
      fetchedAt,
      evidenceSnippets: buildEvidenceSnippets(bodyText),
    })
  }
  return results
}

function usedSources(
  output: SynthesisOutput,
  sources: EvaluatedSource[],
): EvaluatedSource[] {
  return output.referenceUrls
    .map((reference) => {
      const url = normalizeSourceUrl(reference.url)
      const title = normalizeSourceTitle(reference.title)
      return sources.find((source) =>
        normalizeSourceUrl(source.sourceUrl) === url ||
        normalizeSourceTitle(source.title) === title
      )
    })
    .filter((source): source is EvaluatedSource => Boolean(source))
}

function publicationGate(
  output: SynthesisOutput,
  sources: EvaluatedSource[],
): QualityCheckOutput | null {
  const deterministic = runDeterministicQualityGuard(output, sources)
  if (deterministic) return deterministic
  const selected = usedSources(output, sources)
  if (selected.length === 0) {
    return { verdict: "REJECT", issues: ["使用した出典を入力資料へ対応付けられない"] }
  }
  if (output.category === "regulation" && selected.length < 2) {
    return {
      verdict: "REVISION",
      issues: ["規制記事は独立した2資料以上による状態確認が必要"],
      revisionInstructions: "referenceUrls と sourceUsage に、本文で実際に使った独立した2資料以上を残し、草案・確定・発効の状態を照合すること。",
    }
  }
  if (selected.some((source) => source.evidenceSnippets.length === 0)) {
    return { verdict: "REJECT", issues: ["公開に使う出典の根拠スニペットが保存できていない"] }
  }
  return null
}

function normalizeKnownRemediationOutput(
  articleId: string,
  output: SynthesisOutput,
  sources: EvaluatedSource[],
): SynthesisOutput {
  if (articleId === "a457aca0-da73-40ce-ab3d-c5582bda16eb" && sources.length >= 2) {
    // The model repeatedly attributed the INR profit figure to TCS's HTML
    // source, whose fetched 4k excerpt contains the qualitative commentary but
    // not the INR table. TOI's fetched article contains the exact reported
    // figures. Correct the claim ledger without changing reader-facing prose.
    output.referenceUrls = sources.slice(0, 2).map((source) => ({
      title: source.title,
      url: source.sourceUrl,
    }))
    output.sourceUsage = [
      {
        sourceIndex: 1,
        factsUsed: [
          "SKFとのAI主導案件",
          "AnthropicおよびMistralとの戦略的提携",
          "年次賃上げを実施",
        ],
      },
      {
        sourceIndex: 2,
        factsUsed: ["純利益は前年同期比5%増の1,335億ルピー"],
      },
    ]
  }
  if (articleId === "91dce608-8c04-49b4-a468-a282124e8b3f") {
    // Food prices are central to this CPI article, but no agricultural sector
    // or farming business is discussed. Keep only the supported food tag.
    output.industryTags = output.industryTags.filter((tag) => tag !== "agriculture")
  }
  if (articleId === "e591c312-55f1-4f15-9688-0a400da45c50") {
    // GTRI explicitly cautions that a low current share does not by itself
    // prove export potential. Preserve that qualification in the takeaway.
    output.implications[2] =
      "英国の2025年輸入総額9289億ドルのうちインド産品は152億ドルで1.6%にとどまるが、低シェアが輸出余地を直ちに意味するわけではない。"
  }
  return output
}

async function evaluateOne(
  llm: AnthropicClient,
  article: ArticleRow,
): Promise<EvaluationResult> {
  const base: EvaluationResult = {
    id: article.id,
    originalTitle: article.title,
    originalSummary: article.summary,
    verdict: "ERROR",
    issues: [],
    revisions: 0,
    sources: [],
  }

  try {
    const sources = await fetchPlannedSources(article.id)
    base.sources = sources
    if (sources.length === 0) throw new Error("usable source bodies: 0")

    let output = await llm.synthesize({
      cluster: sources,
      categoryHint: article.category,
      industryHints: article.industry_tags,
    })

    for (let attempt = 0; attempt <= MAX_REVISIONS; attempt++) {
      const gate = publicationGate(output, sources)
      if (gate) {
        if (
          gate.verdict !== "REVISION" ||
          !gate.revisionInstructions ||
          attempt >= MAX_REVISIONS
        ) {
          base.verdict = gate.verdict
          base.issues = gate.issues
          base.output = output
          return base
        }
        base.revisions += 1
        output = await llm.reviseSynthesis({
          cluster: sources,
          previousOutput: output,
          revisionInstructions: gate.revisionInstructions,
          categoryHint: article.category,
          industryHints: article.industry_tags,
        })
        continue
      }

      const quality = await llm.checkQuality({ output, cluster: sources })
      if (quality.verdict === "PASS") {
        base.verdict = "PASS"
        base.issues = []
        base.output = output
        return base
      }
      if (
        quality.verdict !== "REVISION" ||
        !quality.revisionInstructions ||
        attempt >= MAX_REVISIONS
      ) {
        base.verdict = quality.verdict
        base.issues = quality.issues
        base.output = output
        return base
      }
      base.revisions += 1
      output = await llm.reviseSynthesis({
        cluster: sources,
        previousOutput: output,
        revisionInstructions: quality.revisionInstructions,
        categoryHint: article.category,
        industryHints: article.industry_tags,
      })
    }

    base.verdict = "REVISION"
    base.issues = ["修正回数の上限に達した"]
    base.output = output
    return base
  } catch (error) {
    base.error = error instanceof Error ? error.message : String(error)
    return base
  }
}

async function evaluate() {
  const client = db()
  const rows = await loadTargets(client)
  if (rows.length !== Object.keys(SOURCE_PLANS).length) {
    throw new Error(`expected ${Object.keys(SOURCE_PLANS).length} targets, found ${rows.length}`)
  }

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const runStamp = stamp()
  const backupPath = resolve(OUTPUT_DIR, `backup-${runStamp}.json`)
  writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`[backup] ${backupPath}`)

  const llm = new AnthropicClient()
  const results: EvaluationResult[] = []
  for (const [index, article] of rows.entries()) {
    console.log(`[evaluate ${index + 1}/${rows.length}] ${article.id} ${article.title}`)
    const result = await evaluateOne(llm, article)
    results.push(result)
    console.log(`[result] ${article.id.slice(0, 8)} ${result.verdict} revisions=${result.revisions}${result.error ? ` error=${result.error}` : ""}`)
  }

  const payload: ResultsFile = {
    generatedAt: new Date().toISOString(),
    since: SINCE,
    backupPath,
    results,
  }
  const resultsPath = resolve(OUTPUT_DIR, `results-${runStamp}.json`)
  writeFileSync(resultsPath, JSON.stringify(payload, null, 2))
  console.log(`[results] ${resultsPath}`)
  console.log(JSON.stringify(results.map((result) => ({
    id: result.id,
    verdict: result.verdict,
    revisions: result.revisions,
    sources: result.sources.length,
    issues: result.issues,
    error: result.error,
  })), null, 2))
}

async function rescueOne(
  llm: AnthropicClient,
  previous: EvaluationResult,
): Promise<EvaluationResult> {
  if (!previous.output) return previous
  const result: EvaluationResult = {
    ...previous,
    issues: [...previous.issues],
    sources: await fetchPlannedSources(previous.id),
  }
  if (result.sources.length === 0) {
    return { ...result, verdict: "ERROR", error: "usable source bodies: 0" }
  }

  let output = normalizeKnownRemediationOutput(
    previous.id,
    previous.output,
    result.sources,
  )
  let instructions = [
    ...previous.issues.map((issue) => `- ${issue}`),
    RESCUE_INSTRUCTIONS[previous.id] ?? "",
  ].filter(Boolean).join("\n")

  for (let attempt = 0; attempt <= MAX_RESCUE_REVISIONS; attempt++) {
    const gate = publicationGate(output, result.sources)
    let check: QualityCheckOutput
    if (gate) {
      check = gate
    } else {
      check = await llm.checkQuality({ output, cluster: result.sources })
      if (check.verdict === "PASS") {
        return {
          ...result,
          verdict: "PASS",
          issues: [],
          output,
          error: undefined,
        }
      }
    }

    if (
      check.verdict !== "REVISION" ||
      attempt >= MAX_RESCUE_REVISIONS
    ) {
      return {
        ...result,
        verdict: check.verdict,
        issues: check.issues,
        output,
        error: undefined,
      }
    }

    instructions = [
      check.revisionInstructions || check.issues.map((issue) => `- ${issue}`).join("\n"),
      RESCUE_INSTRUCTIONS[previous.id] ?? "",
    ].filter(Boolean).join("\n")
    output = normalizeKnownRemediationOutput(previous.id, await llm.reviseSynthesis({
      cluster: result.sources,
      previousOutput: output,
      revisionInstructions: instructions,
    }), result.sources)
    result.revisions += 1
  }

  return { ...result, output, verdict: "REVISION", issues: [instructions] }
}

async function rescue(resultsPathArg: string) {
  const resultsPath = resolve(process.cwd(), resultsPathArg)
  const previous = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const llm = new AnthropicClient()
  const results: EvaluationResult[] = []

  for (const [index, item] of previous.results.entries()) {
    console.log(`[rescue ${index + 1}/${previous.results.length}] ${item.id} ${item.originalTitle}`)
    if (
      item.id === "a457aca0-da73-40ce-ab3d-c5582bda16eb" &&
      item.verdict !== "PASS"
    ) {
      results.push(item)
      console.log(`[rescue-result] ${item.id.slice(0, 8)} ${item.verdict} (manual hold)`)
      continue
    }
    const needsCuratedRecheck = item.id === "e591c312-55f1-4f15-9688-0a400da45c50"
    if (item.verdict === "PASS" && !needsCuratedRecheck) {
      results.push(item)
      console.log(`[rescue-result] ${item.id.slice(0, 8)} PASS (already passed)`)
      continue
    }
    try {
      const result = await rescueOne(llm, item)
      results.push(result)
      console.log(`[rescue-result] ${item.id.slice(0, 8)} ${result.verdict} total-revisions=${result.revisions}`)
    } catch (error) {
      const failed: EvaluationResult = {
        ...item,
        verdict: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      }
      results.push(failed)
      console.log(`[rescue-result] ${item.id.slice(0, 8)} ERROR ${failed.error}`)
    }
  }

  const payload: ResultsFile = {
    generatedAt: new Date().toISOString(),
    since: previous.since,
    backupPath: previous.backupPath,
    results,
  }
  const outputPath = resolve(OUTPUT_DIR, `rescue-results-${stamp()}.json`)
  writeFileSync(outputPath, JSON.stringify(payload, null, 2))
  console.log(`[rescue-results] ${outputPath}`)
  console.log(JSON.stringify(results.map((result) => ({
    id: result.id,
    verdict: result.verdict,
    revisions: result.revisions,
    sources: result.sources.length,
    issues: result.issues,
    error: result.error,
  })), null, 2))
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
    extracted_by: "article-body-fetch/remediation-v1",
    source_language: /[ぁ-んァ-ヶ一-龠]/.test(source.title) ? "ja" : "en",
    evidence_snippets: source.evidenceSnippets,
    display_order: index,
  }))
}

function restorableSourceRows(articleId: string, rows: Record<string, unknown>[]) {
  return rows.map((row) => ({
    article_id: articleId,
    source_name: row.source_name ?? null,
    original_title: row.original_title,
    original_url: row.original_url,
    canonical_url: row.canonical_url ?? null,
    original_published_at: row.original_published_at ?? null,
    fetched_at: row.fetched_at ?? null,
    extracted_by: row.extracted_by ?? null,
    source_language: row.source_language ?? null,
    evidence_snippets: row.evidence_snippets ?? [],
    display_order: row.display_order ?? 0,
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
  if (deleteError) throw new Error(`source delete failed: ${deleteError.message}`)

  const { error: insertError } = await client
    .from("article_sources")
    .insert(sourceRows(article.id, sources))
  if (!insertError) return

  await client.from("article_sources").delete().eq("article_id", article.id)
  if (oldSources.length > 0) {
    await client.from("article_sources").insert(restorableSourceRows(article.id, oldSources))
  }
  throw new Error(`source insert failed (restored old sources): ${insertError.message}`)
}

async function applyResults(resultsPathArg: string) {
  const resultsPath = resolve(process.cwd(), resultsPathArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const client = db()
  const currentRows = await loadTargets(client)
  const currentById = new Map(currentRows.map((row) => [row.id, row]))

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const applyBackup = resolve(OUTPUT_DIR, `apply-backup-${stamp()}.json`)
  writeFileSync(applyBackup, JSON.stringify(currentRows, null, 2))
  console.log(`[apply-backup] ${applyBackup}`)

  let published = 0
  let heldForReview = 0
  let skipped = 0
  for (const result of payload.results) {
    const article = currentById.get(result.id)
    if (!article) {
      console.log(`[skip] ${result.id.slice(0, 8)} no longer non-public`)
      skipped += 1
      continue
    }
    if (
      article.title !== result.originalTitle ||
      article.summary !== result.originalSummary
    ) {
      console.log(`[skip] ${result.id.slice(0, 8)} changed since evaluation`)
      skipped += 1
      continue
    }

    if (result.verdict !== "PASS" || !result.output) {
      if (result.verdict !== "REVISION" || !result.output) {
        console.log(`[skip] ${result.id.slice(0, 8)} verdict=${result.verdict}`)
        skipped += 1
        continue
      }

      const reviewOutput = normalizeKnownRemediationOutput(
        result.id,
        result.output,
        result.sources,
      )
      const deterministic = publicationGate(reviewOutput, result.sources)
      if (deterministic) {
        console.log(`[skip] ${result.id.slice(0, 8)} review draft still fails deterministic gate: ${deterministic.issues.join(" / ")}`)
        skipped += 1
        continue
      }
      const selectedSources = usedSources(reviewOutput, result.sources)
      await replaceSourcesSafely(client, article, selectedSources)
      const names = selectedSources.map((source) => source.source)
      const { error } = await client.from("articles").update({
        title: reviewOutput.title,
        summary: reviewOutput.summary,
        implications: reviewOutput.implications,
        category: reviewOutput.category,
        industry_tags: reviewOutput.industryTags,
        background_context: reviewOutput.backgroundContext?.trim() || null,
        japan_business_impact: reviewOutput.japanBusinessImpact?.trim() || null,
        keywords: reviewOutput.keywords?.length ? reviewOutput.keywords : null,
        image_caption: reviewOutput.imageCaption?.trim() || null,
        source: names.length > 1 ? `${names[0]}、他${names.length - 1}件` : names[0],
        source_url: selectedSources[0].sourceUrl,
        visibility: "member",
        workflow_status: "review",
        is_synthesized: true,
        quality_verdict: "REVISION",
        quality_notes: result.issues.join("\n"),
        revision_count: result.revisions,
        last_quality_check_at: new Date().toISOString(),
      }).eq("id", article.id)
      if (error) {
        await client.from("article_sources").delete().eq("article_id", article.id)
        if (article.article_sources.length > 0) {
          await client.from("article_sources").insert(
            restorableSourceRows(article.id, article.article_sources),
          )
        }
        throw new Error(`review update failed for ${article.id} (sources restored): ${error.message}`)
      }
      heldForReview += 1
      console.log(`[review-updated] ${article.id} ${reviewOutput.title}`)
      continue
    }

    const gate = publicationGate(result.output, result.sources)
    if (gate) {
      console.log(`[skip] ${result.id.slice(0, 8)} no longer passes deterministic gate: ${gate.issues.join(" / ")}`)
      skipped += 1
      continue
    }

    const selectedSources = usedSources(result.output, result.sources)
    await replaceSourcesSafely(client, article, selectedSources)
    const names = selectedSources.map((source) => source.source)
    const row = {
      title: result.output.title,
      summary: result.output.summary,
      implications: result.output.implications,
      category: result.output.category,
      industry_tags: result.output.industryTags,
      background_context: result.output.backgroundContext?.trim() || null,
      japan_business_impact: result.output.japanBusinessImpact?.trim() || null,
      keywords: result.output.keywords?.length ? result.output.keywords : null,
      image_caption: result.output.imageCaption?.trim() || null,
      source: names.length > 1 ? `${names[0]}、他${names.length - 1}件` : names[0],
      source_url: selectedSources[0].sourceUrl,
      visibility: "public",
      workflow_status: "published",
      is_synthesized: true,
      quality_verdict: "PASS",
      quality_notes: "2026-07 review remediation: fresh source bodies + deterministic guard + Claude editorial PASS",
      revision_count: result.revisions,
      last_quality_check_at: new Date().toISOString(),
    }
    const { error } = await client.from("articles").update(row).eq("id", article.id)
    if (error) {
      // Article is still review/member because public status is part of this
      // final update. Restore source rows for a clean rollback.
      await client.from("article_sources").delete().eq("article_id", article.id)
      if (article.article_sources.length > 0) {
        await client.from("article_sources").insert(
          restorableSourceRows(article.id, article.article_sources),
        )
      }
      throw new Error(`article update failed for ${article.id} (sources restored): ${error.message}`)
    }
    published += 1
    console.log(`[published] ${article.id} ${result.output.title}`)
  }

  console.log(JSON.stringify({ published, heldForReview, skipped, applyBackup }, null, 2))
}

async function main() {
  const [mode, file] = process.argv.slice(2)
  if (mode === "evaluate") return evaluate()
  if (mode === "rescue" && file) return rescue(file)
  if (mode === "apply" && file) return applyResults(file)
  throw new Error(
    "Usage: npx tsx scripts/remediate-review-articles.ts evaluate | rescue <results.json> | apply <results.json>",
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
