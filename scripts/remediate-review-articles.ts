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
import { getImageClient, type ImageClient } from "../lib/image-gen/index.ts"
import { buildSafeImagePrompt } from "../lib/image-gen/safe-prompt.ts"
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

const SINCE = "2026-07-16T15:00:00Z"
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
  "2b99d260-1071-414b-bc8e-6b0e6d46881e": [
    {
      source: "Mint",
      title: "RBI shoots down lenders' ask to sell immovable collateral back to defaulters",
      url: "https://www.livemint.com/news/rbi-shoots-down-lenders-ask-to-sell-immovable-collateral-back-to-defaulters-11784210843133.html",
      publishedAt: "2026-07-16",
    },
    {
      source: "ETBFSI",
      title: "Banks cannot sell back recovered immovable properties to borrowers: RBI",
      url: "https://bfsi.economictimes.indiatimes.com/amp/news/banking/banks-cannot-sell-back-recovered-immovable-properties-to-borrowers-rbi/132442441",
      publishedAt: "2026-07-16",
    },
  ],
  "0cd84db4-2de2-43c5-a0ce-7db7688ddf54": [
    {
      source: "Crisil Intelligence",
      title: "Cost pass-through likely lifted corporate revenue to 11-11.5% in Q1",
      url: "https://intelligence.crisil.com/en/homepage/newsroom/press-releases/2026/07/cost-pass-through-likely-lifted-corporate-revenue-to-11-11-5-percent-in-q1.html",
      publishedAt: "2026-07-16",
    },
    {
      source: "Times of India",
      title: "Pricing, not volume, drives India Inc in Q1; revenue estimated to grow 11-11.5% despite supply disruptions: Crisil",
      url: "https://timesofindia.indiatimes.com/business/india-business/pricing-not-volume-drives-india-inc-in-q1-revenue-estimated-to-grow-11-11-5-despite-supply-disruptions-crisil/articleshow/132447972.cms",
      publishedAt: "2026-07-16",
    },
  ],
  "81d00b7a-d291-4f58-bddb-7ae27cff8e71": [
    {
      source: "JETRO",
      title: "日印首脳会談が首都ニューデリーで開催、次世代燃料分野などで協力へ",
      url: "https://www.jetro.go.jp/biznews/2026/07/784e9e7c1709c338.html",
      publishedAt: "2026-07-14",
    },
    {
      source: "外務省",
      title: "Japan-India Summit Meeting",
      url: "https://www.mofa.go.jp/s_sa/sw/in/pageite_000001_01706.html",
      publishedAt: "2026-07-02",
    },
  ],
  "e8952191-c19b-4622-80b0-ac8b6569cb77": [
    {
      source: "ETCFO",
      title: "RBI likely to keep rates unchanged till October, India's GDP to moderate to 6.6-6.8% in FY27: BoB Outlook",
      url: "https://cfo.economictimes.indiatimes.com/news/economy/rbi-likely-to-keep-rates-unchanged-till-october-indias-gdp-to-moderate-to-6-6-6-8-in-fy27-bob-outlook/132379314",
      publishedAt: "2026-07-13",
    },
    {
      source: "Business Standard",
      title: "Bank of Baroda raises India's FY27 GDP growth forecast to 6.6-6.8%",
      url: "https://www.business-standard.com/economy/news/bank-of-baroda-raises-india-s-fy27-gdp-growth-forecast-to-6-6-6-8-126071301300_1.html",
      publishedAt: "2026-07-13",
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
  "2b99d260-1071-414b-bc8e-6b0e6d46881e":
    "RBI規制の2026年10月1日の適用開始、原則7年以内の処分、元債務者への売り戻し禁止を入力2資料で照合すること。草案公表時期は年を補わず単に『5月』とするか削除し、『最終化』『最終規則の全容』とは書かず『RBIが方向を示した』『新たな指示』と資料に忠実に表現すること。規制記事なので両資料を本文で実質的に使い、referenceUrlsとsourceUsageに残すこと。",
  "0cd84db4-2de2-43c5-a0ce-7db7688ddf54":
    "TCSとWiproを『2社』と数えず実名で書くこと。11〜11.5%はCrisilの第1四半期企業売上高予測で、数量ではなく価格転嫁が寄与したという位置付けを保持すること。backgroundContextとjapanBusinessImpactは入力資料の事実だけで各180〜220字にすること。根拠が足りない方はnull、直接的な日本企業影響が確認できない場合は許可された短い定型文にすること。",
  "81d00b7a-d291-4f58-bddb-7ae27cff8e71":
    "JETROと外務省の2資料に共通する首脳会談の合意事項を主軸にし、2兆円の対印民間投資目標とバイオガスプラント1,000基協力はカンマ表記を含め入力資料どおり照合すること。industryTagsからlogisticsとchemicalsを必ず削除すること。backgroundContextは入力資料の事実だけで180〜220字にするか、根拠が足りなければnullにすること。",
  "e8952191-c19b-4622-80b0-ac8b6569cb77":
    "Bank of BarodaがFY27成長率予測を6.6〜6.8%へ引き上げた点を主軸にすること。政策金利、インフレ、産業別予測は入力本文にある数値だけを使い、英語per centと日本語%の表記差を事実差とみなさないこと。40字未満になるRBIやFY27のキーワード解説は無理に伸ばさずkeywordsから削除すること。",
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
    .in("id", Object.keys(SOURCE_PLANS))
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
  const allowedTags = new Set([
    "automotive", "semiconductor", "machine_tools", "food", "chemicals",
    "energy", "logistics", "agriculture", "steel", "education", "entertainment",
    "talent",
  ])
  output.industryTags = output.industryTags.filter((tag) => allowedTags.has(tag))

  // Optional enrichment fragments do not justify holding the whole article.
  if (output.backgroundContext && output.backgroundContext.trim().length < 150) {
    output.backgroundContext = undefined
  }
  if (
    output.japanBusinessImpact &&
    output.japanBusinessImpact.trim().length < 150 &&
    !/日本企業への直接的な影響.*確認でき(?:ません|ない)/.test(output.japanBusinessImpact)
  ) {
    output.japanBusinessImpact = undefined
  }
  output.keywords = output.keywords?.filter(
    (keyword) => keyword.definition.trim().length >= 40,
  )

  if (articleId === "0cd84db4-2de2-43c5-a0ce-7db7688ddf54") {
    output.summary = output.summary.replace(
      "銀行・金融サービス・石油ガスを除く47業種、400社超を対象にした分析で、",
      "400社超を対象にした分析で、",
    )
    output.summary = output.summary.replace(
      /IT大手のTCSとWiproも決算発表を控えている。?$/,
      "",
    )
    output.summary = output.summary.replace(
      /FMCGは値上げにより6〜7%増となる見込みで、?$/,
      "FMCGは値上げにより6〜7%増となる見込みだ。",
    )
    output.sourceUsage = output.sourceUsage?.map((usage) => ({
      ...usage,
      factsUsed: usage.factsUsed.filter(
        (fact) => !/TCS|Wipro|ウィプロ/.test(fact),
      ),
    }))
    output.industryTags = []
  }
  if (articleId === "e8952191-c19b-4622-80b0-ac8b6569cb77") {
    output.industryTags = []
    output.implications[2] =
      "製造業は6.5〜7.5%、農業は2.5〜3%の成長が見込まれ、インド事業の需要環境を考える材料となる。"
  }
  if (articleId === "81d00b7a-d291-4f58-bddb-7ae27cff8e71") {
    output.title = output.title.replaceAll("1,000機", "1,000基")
    output.summary = output.summary.replaceAll("1,000機", "1,000基")
    output.implications = output.implications.map((item) =>
      item.replaceAll("1,000機", "1,000基")
    )
  }
  if (articleId === "2b99d260-1071-414b-bc8e-6b0e6d46881e") {
    if (!/草案/.test(output.title)) {
      output.title = `${output.title}（5月草案への回答）`
    }
    output.summary = output.summary.replace(
      /動産の対象組み入れ要望も承認されず、金や証券には既存の別枠の規制が適用される。/,
      "",
    )
    if (!output.summary.includes("動産は減価が速く")) {
      output.summary = output.summary.replace(
        "関連する指示は2026年10月1日に施行される予定だ。",
        "金融機関は動産も枠組みに含めるよう求めたが、RBIは承認しなかった。RBIは金と投資資産を除く動産は減価が速く経済寿命も短いため、直ちに自社利用できない限り所有する誘因は乏しいと説明した。関連する指示は2026年10月1日に施行される予定だ。",
      )
    }
    output.japanBusinessImpact =
      "現時点で公表されている情報からは、日本企業への直接的な影響は確認できない。"
    output.implications = output.implications.map((item) =>
      item.replace("SMA段階(延滞1〜90日)", "SMA段階")
    )
    output.sourceUsage = output.sourceUsage?.map((usage) => ({
      ...usage,
      factsUsed: usage.factsUsed.filter(
        (fact) => !/動産の対象組み入れ|金や証券/.test(fact),
      ),
    }))
    const primaryUsage = output.sourceUsage?.find((usage) => usage.sourceIndex === 1)
    if (primaryUsage) {
      primaryUsage.factsUsed.push(
        "金融機関は動産も枠組みに含めるよう求めたがRBIは承認しなかった",
        "金と投資資産を除く動産は減価が速く経済寿命も短い",
      )
    }
  }
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

  // Apply the article-specific audit findings once even when a second
  // stochastic editorial check happens to return PASS for the unchanged
  // draft. This prevents known factual/state issues from being bypassed.
  if (RESCUE_INSTRUCTIONS[previous.id]) {
    output = normalizeKnownRemediationOutput(previous.id, await llm.reviseSynthesis({
      cluster: result.sources,
      previousOutput: output,
      revisionInstructions: instructions,
    }), result.sources)
    result.revisions += 1
  }

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
    const needsCuratedRecheck = Boolean(RESCUE_INSTRUCTIONS[item.id])
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

async function recheck(resultsPathArg: string) {
  const resultsPath = resolve(process.cwd(), resultsPathArg)
  const previous = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const llm = new AnthropicClient()
  const currentRows = await loadTargets(db())
  const currentById = new Map(currentRows.map((row) => [row.id, row]))
  const results: EvaluationResult[] = []

  for (const item of previous.results) {
    if (item.verdict === "PASS" || !item.output) {
      results.push(item)
      continue
    }
    const output = normalizeKnownRemediationOutput(item.id, item.output, item.sources)
    const gate = publicationGate(output, item.sources)
    const quality = gate ?? await llm.checkQuality({ output, cluster: item.sources })
    const current = currentById.get(item.id)
    results.push({
      ...item,
      originalTitle: current?.title ?? item.originalTitle,
      originalSummary: current?.summary ?? item.originalSummary,
      verdict: quality.verdict,
      issues: quality.issues,
      output,
      error: undefined,
    })
    console.log(`[recheck-result] ${item.id.slice(0, 8)} ${quality.verdict}: ${quality.issues.join(" / ")}`)
  }

  const payload: ResultsFile = {
    generatedAt: new Date().toISOString(),
    since: previous.since,
    backupPath: previous.backupPath,
    results,
  }
  const outputPath = resolve(OUTPUT_DIR, `recheck-results-${stamp()}.json`)
  writeFileSync(outputPath, JSON.stringify(payload, null, 2))
  console.log(`[recheck-results] ${outputPath}`)
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

async function generateRequiredImage(
  imageClient: ImageClient,
  output: SynthesisOutput,
  fallbackTitle: string,
): Promise<string> {
  const prompt = buildSafeImagePrompt(output.imagePrompt, fallbackTitle)
  if (!prompt) throw new Error("safe image prompt is empty")

  let lastError = "unknown image error"
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const generated = await imageClient.generate({ prompt })
      if (!generated.imageUrl) throw new Error("image provider returned an empty URL")
      console.log(`[image] generated ${attempt}/2 model=${generated.model}`)
      return generated.imageUrl
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      console.warn(`[image] attempt ${attempt}/2 failed: ${lastError.replace(/\s+/g, " ").slice(0, 500)}`)
    }
  }
  throw new Error(lastError)
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
  const imageGenerator = getImageClient()
  if (!imageGenerator) {
    throw new Error("configured image client is unavailable; refusing to publish without images")
  }
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

    const publishOutput = normalizeKnownRemediationOutput(
      result.id,
      result.output,
      result.sources,
    )
    const gate = publicationGate(publishOutput, result.sources)
    if (gate) {
      console.log(`[skip] ${result.id.slice(0, 8)} no longer passes deterministic gate: ${gate.issues.join(" / ")}`)
      skipped += 1
      continue
    }

    let imageUrl: string
    try {
      imageUrl = await generateRequiredImage(imageGenerator, publishOutput, result.originalTitle)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await client.from("articles").update({
        quality_verdict: "REVISION",
        quality_notes: `再審査PASS後の画像生成に失敗したため公開保留: ${message.replace(/\s+/g, " ").slice(0, 500)}`,
        last_quality_check_at: new Date().toISOString(),
      }).eq("id", article.id)
      heldForReview += 1
      console.log(`[image-held] ${result.id.slice(0, 8)} ${message}`)
      continue
    }

    const selectedSources = usedSources(publishOutput, result.sources)
    await replaceSourcesSafely(client, article, selectedSources)
    const names = selectedSources.map((source) => source.source)
    const row = {
      title: publishOutput.title,
      summary: publishOutput.summary,
      implications: publishOutput.implications,
      category: publishOutput.category,
      industry_tags: publishOutput.industryTags,
      background_context: publishOutput.backgroundContext?.trim() || null,
      japan_business_impact: publishOutput.japanBusinessImpact?.trim() || null,
      keywords: publishOutput.keywords?.length ? publishOutput.keywords : null,
      image_url: imageUrl,
      source: names.length > 1 ? `${names[0]}、他${names.length - 1}件` : names[0],
      source_url: selectedSources[0].sourceUrl,
      visibility: "public",
      workflow_status: "published",
      is_synthesized: true,
      quality_verdict: "PASS",
      quality_notes: "2026-07-17 review remediation: fresh source bodies + deterministic guard + Claude editorial PASS + image generation success",
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
    console.log(`[published] ${article.id} ${publishOutput.title}`)
  }

  console.log(JSON.stringify({ published, heldForReview, skipped, applyBackup }, null, 2))
}

async function main() {
  const [mode, file] = process.argv.slice(2)
  if (mode === "evaluate") return evaluate()
  if (mode === "rescue" && file) return rescue(file)
  if (mode === "recheck" && file) return recheck(file)
  if (mode === "apply" && file) return applyResults(file)
  throw new Error(
    "Usage: npx tsx scripts/remediate-review-articles.ts evaluate | rescue <results.json> | recheck <results.json> | apply <results.json>",
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
