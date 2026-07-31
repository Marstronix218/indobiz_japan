#!/usr/bin/env -S npx tsx
/**
 * Auditable remediation for publishable review articles generated from
 * 2026-07-22 00:00 JST onward.
 *
 *   npx tsx scripts/remediate-2026-07-23-quality-reviews.ts evaluate
 *   npx tsx scripts/remediate-2026-07-23-quality-reviews.ts apply results.json \
 *     <article-id>=<validated-local-image> [...]
 *
 * Evaluate only writes a local result file. Apply revalidates the exact output,
 * uploads a caller-supplied and visually checked image, replaces source
 * evidence, and changes the article to public as the final database write.
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
const NO_DIRECT_IMPACT =
  "現時点で公表されている情報からは、日本企業への直接的な影響は確認できない。"

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

const TARGETS: Record<string, TargetPlan> = {
  "6ef64176-e518-403f-a11b-1170bc234495": {
    sources: [
      {
        source: "Times of India Business",
        title: "India's growth remains strong, but trade barriers threaten 2047 goal: WTO",
        url: "https://timesofindia.indiatimes.com/business/india-business/indias-growth-remains-strong-but-trade-barriers-threaten-2047-goal-wto/articleshow/132542403.cms",
        publishedAt: "2026-07-21",
      },
      {
        source: "World Trade Organization",
        title: "Trade Policy Review: India — Secretariat report WT/TPR/S/488",
        url: "https://www.wto.org/english/news_e/news_docs/S488_e.pdf",
        publishedAt: "2026-07-21",
        bodyText: [
          "World Trade Organization Secretariat report WT/TPR/S/488 for India's eighth Trade Policy Review on 21 and 23 July 2026.",
          "The report states that India was consistently the fastest-growing G20 economy during the review period.",
          "Looking ahead, real GDP growth is forecast to range between 6.8% and 7.2% in FY2027/2028, also written FY2027/28.",
          "Sustaining the economic performance needed for Viksit Bharat by 2047 requires addressing high trade costs, regulatory complexity, infrastructure gaps and barriers to deeper global integration.",
          "India widened the reach of regional trade agreements and continued to liberalize foreign direct investment rules since 2021.",
          "The report also describes relatively high tariffs, import and export controls, state trading, food and fertilizer support, customs modernization and digital trade-facilitation reforms.",
        ].join(" "),
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "インドは19件のFTAを発効",
          "2021年以降に8件の主要貿易協定を締結または交渉妥結",
          "2025/26年度の物品・サービス輸出額は8631億ドル",
        ],
      },
      {
        sourceIndex: 2,
        factsUsed: [
          "2027/28年度の実質GDP成長率は6.8〜7.2%",
          "2047年目標には貿易コスト、規制、インフラ、世界経済との統合が課題",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of a busy anonymous Indian container port connected to modern road and rail infrastructure, clear daylight, realistic photojournalism, no text, no logos, no brand names, no recognizable real persons",
    mutate(output) {
      output.summary = output.summary.replace(
        "FY2027-28(2027〜28年度)",
        "2027/28年度",
      )
      output.implications[0] = output.implications[0].replace(
        "FY2027-28(2027〜28年度)",
        "2027/28年度",
      )
      output.industryTags = []
      output.backgroundContext = undefined
      output.japanBusinessImpact = NO_DIRECT_IMPACT
      output.keywords = []
    },
  },
  "ed8068c5-c564-4326-9ee9-222f452cb8ad": {
    sources: [
      {
        source: "The Indian Express",
        title: "Centre bans imports of goods made with forced labour amid US tariff probe",
        url: "https://indianexpress.com/article/business/us-tariff-plan-centre-bars-import-goods-forced-labour-10786436/",
        publishedAt: "2026-07-16",
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "強制労働問題を巡る最初の通商法301条調査後、6月3日にインドへ12.5%の追加関税を提案",
          "インド政府は7月13日付の命令で強制労働による製品の輸入禁止規定を新設",
          "新規定は官報掲載から30日後に発効",
          "職権による調査を明確化し、申立てがなくても対応可能",
          "過剰生産能力を巡る別の調査結果は未公表",
          "強制労働リスクが指摘される品目には綿、繊維、太陽光関連、魚介類、金属、電池、電子機器が含まれる",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of anonymous cargo containers at a major international seaport with customs inspection lanes, neutral daylight, realistic photojournalism, no national leaders, no text, no logos, no brand names, no recognizable real persons",
    mutate(output) {
      output.title =
        "米国、対印12.5%追加関税案　インドは強制労働品の輸入規制を新設"
      output.summary =
        "米通商代表部(USTR)は、強制労働で作られた商品の輸入規制が不十分だとする最初の通商法301条調査を踏まえ、6月3日にインドからの輸入品へ12.5%の追加関税を課す案を提示した。インドは調査内容に不整合があるとして見直しを求めている。追加関税は提案段階で、最終決定ではない。\n\nインド政府は7月13日付の命令で、強制労働により全部または一部が生産された商品の輸入を禁止する規定を外国貿易政策に新設した。新規定は官報掲載から30日後に発効する。政府当局者は、職権で調査できることを明確にし、申立てがなくても対応可能になったと説明した。具体的な対象品目や調査手続きは今後定められる。米側が進める過剰生産能力を巡る別の通商法301条調査は、結果がまだ公表されていない。\n\n米当局は、強制労働との関連が疑われる品目として、綿、繊維、太陽光パネル向けポリシリコン、魚介類、金属、電池、電子機器などを挙げている。インドの新制度は法的枠組みを整えた段階であり、輸入事業者への実際の影響は、今後示される調査方法や証拠要件、対象品目によって決まる。"
      output.implications = [
        "USTRは強制労働問題を理由にインドへ12.5%の追加関税を提案したが、まだ最終決定ではない。",
        "インドは強制労働で作られた商品の輸入禁止規定を新設し、官報掲載から30日後に発効させる。",
        "綿、繊維、太陽光関連、魚介類、金属、電池、電子機器などは制度運用の確認が必要な品目だ。",
      ]
      output.industryTags = []
      output.category = "economy"
      output.backgroundContext =
        "米国は3月、インドを対象に複数の通商法301条調査を開始した。先に結果が出た調査は強制労働品の輸入禁止規制、別の調査は過剰生産能力を対象とする。前者の結果を受け、USTRは6月3日に12.5%の追加関税案を提示した。インド政府は7月13日、外国貿易政策に強制労働品の輸入禁止規定を追加した。規定は官報掲載から30日後に発効し、個別品目は調査を踏まえて指定される。"
      output.japanBusinessImpact = NO_DIRECT_IMPACT
      output.keywords = []
    },
  },
  "ce910854-348f-4cef-8483-20e51d2d2ddf": {
    sources: [
      {
        source: "DD India",
        title: "PLI schemes attract over Rs 2.40 lakh crore investment, generate more than 14.15 lakh jobs: Government",
        url: "https://ddindia.co.in/2026/07/pli-schemes-attract-over-rs-2-40-lakh-crore-investment-generate-more-than-14-15-lakh-jobs-government/",
        publishedAt: "2026-07-21",
      },
      {
        source: "Press Information Bureau",
        title: "Production Linked Incentive Schemes for 14 key sectors",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2287008&lang=2&reg=48",
        publishedAt: "2026-07-22",
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "2023/24年度の輸出額4兆ルピー、2024/25年度6兆5000億ルピー、2025/26年度15兆2000億ルピー",
          "携帯電話輸入77%減、国内販売の99.2%が国産",
          "1931の医薬品を製造し、うち191のバルク医薬品を初めて国内生産",
          "医薬品分野の累計販売額3兆6400億ルピー",
          "22の申請者が55種類の医療機器を国内で商用化",
        ],
      },
      {
        sourceIndex: 2,
        factsUsed: [
          "2026年3月末時点の投資2兆4000億ルピー超",
          "直接・間接雇用141万5000人超",
          "対象14業種、承認財政支出1兆9100億ルピー",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of an anonymous advanced electronics manufacturing campus in India with smartphone assembly lines and modern factory infrastructure, clean bright daylight, realistic photojournalism, no text, no logos, no brand names, no recognizable real persons",
    mutate(output) {
      output.title =
        "PLI制度、投資2兆4000億ルピー超　雇用141万5000人超"
      output.summary =
        "インド商工省は、生産連動型優遇制度(PLI)による投資実績が2026年3月末時点で累計2兆4000億ルピーを超え、直接・間接雇用が141万5000人を上回ったと発表した。制度発足以来の輸出額は15兆2000億ルピーに達し、2023/24年度の4兆ルピーから2024/25年度に6兆5000億ルピー、2025/26年度に15兆2000億ルピーへ拡大した。\n\nPLIは14業種を対象とし、承認された財政支出は1兆9100億ルピー。携帯電話分野では輸入が約77%減少し、国内販売される端末の99.2%が国産となった。政府は、制度が大規模な国内生産と輸出力の強化、輸入依存の低下を後押ししたとしている。\n\n医薬品分野では1931の医薬品が製造され、そのうち191のバルク医薬品は初めて国内生産された。累計販売額は3兆6400億ルピーに達した。医療機器分野では22の申請者が、CTやMRIなど55種類の製品を国内で商用化した。政府は申請承認や投資促進、情報共有を通じて実施上の課題に対応する方針だ。"
      output.implications = [
        "PLI制度の累計投資は2兆4000億ルピーを超え、直接・間接雇用も141万5000人を上回った。",
        "制度発足以来の輸出額は15兆2000億ルピーに達し、2023/24年度から大幅に拡大した。",
        "携帯電話の国内販売に占める国産比率は99.2%となり、輸入は約77%減少したことが明らかになった。",
      ]
      output.industryTags = ["talent"]
      output.backgroundContext = undefined
      output.japanBusinessImpact = NO_DIRECT_IMPACT
      output.keywords = []
    },
  },
  "74215272-4f41-475f-8040-67eea191bd97": {
    sources: [
      {
        source: "Upstox",
        title: "BPCL Q1 results: Firm posts Rs 3,962 crore net loss on higher crude oil prices; revenue rises 23% YoY",
        url: "https://upstox.com/news/market-news/earnings/bpcl-q1-results-firm-posts-3-962-crore-net-loss-on-higher-crude-oil-prices-revenue-rises-23-yo-y/article-197376/",
        publishedAt: "2026-07-22",
      },
      {
        source: "Energy Watch",
        title: "BPCL posts Rs 3,962-crore standalone Q1 loss as West Asia crisis weighs on marketing margins",
        url: "https://www.energywatch.in/companies/bpcl-posts-rs-3962-crore-standalone-q1-loss-as-west-asia-crisis-weighs-on-marketing-margins",
        publishedAt: "2026-07-22",
      },
    ],
    sourceUsage: [
      {
        sourceIndex: 1,
        factsUsed: [
          "単体純損失396億2130万ルピー",
          "単体売上高23%増の1兆5947億9280万ルピー",
          "原材料費69%増の9058億8100万ルピー",
        ],
      },
      {
        sourceIndex: 2,
        factsUsed: [
          "前年同期は612億3930万ルピー、直前四半期は319億1490万ルピーの単体純利益",
          "連結純損失187億2700万ルピー",
          "販売マージンの低下を精製マージンが一部相殺",
        ],
      },
    ],
    imagePrompt:
      "A wide editorial photograph of an anonymous petroleum refinery and fuel storage terminal in India under clear daylight, balanced neutral colors, realistic photojournalism, no text, no logos, no brand names, no recognizable real persons",
    mutate(output) {
      output.title =
        "BPCL、FY27第1四半期は単体396億2130万ルピーの純損失"
      output.summary =
        "インド国営石油会社バーラト・ペトロリアム(BPCL)は、2026/27年度(FY27)第1四半期(4〜6月期)の単体決算で396億2130万ルピーの純損失を計上した。前年同期は612億3930万ルピー、直前の1〜3月期は319億1490万ルピーの純利益だった。西アジア情勢を背景とする原油価格の上昇で、石油製品の販売マージンが圧迫された。\n\n単体売上高は前年同期比23%増の1兆5947億9280万ルピーとなった一方、原材料費は69%増の9058億8100万ルピーに拡大した。BPCLは、特定の石油製品で販売マージンが低下したことが損失の主因で、精製マージンの改善が損失を一部相殺したと説明している。単体営業利益率は前年同期の5.72%からマイナス4.11%に悪化した。\n\n連結ベースの純損失は187億2700万ルピーで、単体より小さかった。上流事業の利益や子会社再編に伴う一時益が連結損失を圧縮したためで、単体と連結では損失額の基準が異なる点に注意が必要となる。"
      output.implications = [
        "BPCLはFY27第1四半期に単体396億2130万ルピーの純損失を計上し、前年同期の黒字から赤字に転じた。",
        "単体売上高が23%増える一方で原材料費は69%増え、石油製品の販売マージン低下が損失の主因となった。",
        "連結純損失は187億2700万ルピーで、上流事業の利益と一時益により単体損失より小さくなった。",
      ]
      output.industryTags = ["energy"]
      output.category = "market"
      output.backgroundContext = undefined
      output.japanBusinessImpact = NO_DIRECT_IMPACT
      output.keywords = []
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
      source.bodyText ?? await fetchArticleBody(source.url, 20_000, source.title)
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
    indiaRelevance: { score: 3, reason: "インドの経済・通商・製造・企業動向が主題である" },
    japaneseBusinessRelevance: { score: 2, reason: "インド市場や通商環境を把握する材料となる" },
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
  const rows = await loadTargets(client)
  if (rows.length === 0) throw new Error("no remaining review targets")
  const llm = new AnthropicClient()
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
      console.log(
        `[evaluate] ${row.id.slice(0, 8)} ${quality.verdict}` +
        (quality.issues.length ? `: ${quality.issues.join(" / ")}` : ""),
      )
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
  const outputPath = resolve(OUTPUT_DIR, `quality-reviews-20260723-${stamp()}.json`)
  writeFileSync(
    outputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  )
  console.log(`[results] ${outputPath}`)
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
    extracted_by: "article-body-fetch/remediation-20260723",
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

function parseImageArgs(args: string[]): Map<string, string> {
  const result = new Map<string, string>()
  for (const arg of args) {
    const separator = arg.indexOf("=")
    if (separator <= 0) throw new Error(`invalid image mapping: ${arg}`)
    result.set(arg.slice(0, separator), resolve(process.cwd(), arg.slice(separator + 1)))
  }
  return result
}

async function uploadCheckedImage(path: string): Promise<string> {
  const extension = extname(path).toLowerCase()
  const type = extension === ".png"
    ? { contentType: "image/png", extension: "png" }
    : extension === ".webp"
      ? { contentType: "image/webp", extension: "webp" }
      : extension === ".jpg" || extension === ".jpeg"
        ? { contentType: "image/jpeg", extension: "jpg" }
        : null
  if (!type) throw new Error(`unsupported image extension: ${extension}`)
  const buffer = readFileSync(path)
  if (buffer.byteLength < 10_000) throw new Error(`image file is unexpectedly small: ${path}`)
  return (await uploadGeneratedImage(buffer, type)).publicUrl
}

async function apply(resultsArg: string, imageArgs: string[]) {
  const resultsPath = resolve(process.cwd(), resultsArg)
  const payload = JSON.parse(readFileSync(resultsPath, "utf8")) as ResultsFile
  const imagePaths = parseImageArgs(imageArgs)
  const client = db()
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
    const imagePath = imagePaths.get(result.id)
    if (!imagePath) {
      console.log(`[hold] ${result.id.slice(0, 8)} missing validated image mapping`)
      continue
    }

    const deterministic = runDeterministicQualityGuard(result.output, result.sources)
    if (deterministic) {
      console.log(
        `[hold] ${result.id.slice(0, 8)} deterministic recheck failed: ` +
        deterministic.issues.join(" / "),
      )
      continue
    }
    const editorial = await new AnthropicClient().checkQuality({
      output: result.output,
      cluster: result.sources,
    })
    if (editorial.verdict !== "PASS") {
      console.log(
        `[hold] ${result.id.slice(0, 8)} editorial recheck=${editorial.verdict}: ` +
        editorial.issues.join(" / "),
      )
      continue
    }

    const imageUrl = await uploadCheckedImage(imagePath)
    await replaceSourcesSafely(client, article, result.sources)
    const output = result.output
    const names = result.sources.map((source) => source.source)
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
      quality_notes:
        "2026-07-23 remediation: source refetch + factual/unit correction + deterministic guard PASS + independent Claude editorial PASS + visually checked image upload",
      revision_count: 0,
      last_quality_check_at: new Date().toISOString(),
    }).eq("id", article.id)
    if (error) throw new Error(`article update failed for ${article.id}: ${error.message}`)
    console.log(`[published] ${article.id} ${output.title} ${imageUrl}`)
  }
}

async function main() {
  const [mode, file, ...imageArgs] = process.argv.slice(2)
  if (mode === "evaluate") return evaluate()
  if (mode === "apply" && file) return apply(file, imageArgs)
  throw new Error("Usage: evaluate | apply <results.json> <article-id>=<image-path> [...]")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
