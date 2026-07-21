import { test } from "node:test"
import assert from "node:assert/strict"
import { runDeterministicQualityGuard } from "./output-quality-guard.ts"
import type { SynthesisOutput, SynthesisSource } from "./types.ts"

const cluster: SynthesisSource[] = [
  {
    source: "Times of India",
    sourceUrl: "https://example.com/rupee-9463",
    publishedAt: "2026-06-23",
    title: "Rupee falls to 94.63 as RBI intervenes",
    bodyText: "The rupee declined to 94.63 per dollar as the Reserve Bank of India intervened in the foreign exchange market.",
  },
  {
    source: "Reuters",
    sourceUrl: "https://example.com/old-rupee",
    publishedAt: "2026-06-10",
    title: "Rupee at 93.90 in earlier session",
    bodyText: "The rupee traded at 93.90 per dollar earlier in June.",
  },
]

const validSummary = [
  "インドルピーは1ドル＝94.63ルピーまで下落し、インド準備銀行が外為市場で介入した。",
  "通貨安は輸入企業のドル建て支払いを重くし、部材を海外から調達する製造業には採算管理の見直しを迫る。",
  "短期では支払い時期、ヘッジ比率、販売契約の価格転嫁条項を同じ前提レートで点検する必要がある。",
  "インド市場で販売と調達を併せ持つ日本企業にとっては、為替の一時的な振れを営業だけで吸収するのではなく、財務、調達、販売が同じシナリオで判断することが重要となる。",
  "今後もルピー相場が不安定に推移すれば、在庫水準や見積もり有効期限の設定にも影響が広がる。",
  "現地で部材を調達する企業も、輸入品との価格差が変われば仕入れ先の選定や顧客への提示価格を見直す必要がある。",
  "金融当局の介入が続く局面では、短期の反発を前提にした楽観的な予算より、複数の為替レンジを置いた管理が現実的である。",
  "販売現場では値上げ時期を遅らせるほど採算悪化が蓄積するため、契約更新のタイミングを早めに洗い出すことが求められる。",
  "為替変動を単発の市場ニュースとして扱わず、調達計画と価格政策を結ぶ管理指標として見る姿勢が問われている。",
  "そのため、各部門の前提レートを毎週更新する体制が欠かせない。",
].join("")

function output(overrides: Partial<SynthesisOutput>): SynthesisOutput {
  return {
    title: "ルピーが94.63まで下落、RBIが外為市場に介入",
    summary: validSummary,
    implications: [
      "ルピー下落で輸入採算の再確認が必要となり、ドル建て部材を扱う製造業は支払い条件の点検を迫られる。",
      "インド準備銀行の市場介入が続く局面では、財務と調達が同じ為替前提を共有して予算を管理する必要がある。",
      "販売契約の価格転嫁条項と見積もり有効期限を見直し、為替変動を部門横断で管理する体制が重要となる。",
    ],
    industryTags: [],
    category: "market",
    referenceUrls: [{ title: cluster[0].title, url: cluster[0].sourceUrl }],
    sourceUsage: [{ sourceIndex: 1, factsUsed: ["94.63 per dollar"] }],
    indiaRelevance: { score: 3, reason: "インド通貨が主題" },
    japaneseBusinessRelevance: { score: 2, reason: "輸入コストに影響" },
    imagePrompt: "bright daylight photojournalism style no text no logos",
    ...overrides,
  }
}

test("passes a well-supported article", () => {
  assert.equal(runDeterministicQualityGuard(output({}), cluster), null)
})

test("accepts a summary at the new 430-character lower bound", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: "要".repeat(430),
    }),
    cluster,
  )

  assert.equal(qc, null)
})

test("flags generated body text outside the target length", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: "インドルピーは1ドル＝94.63ルピーまで下落した。",
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("summary の文字数")))
})

test("flags takeaways outside the 40 to 90 character range", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: [
        "ルピー下落で輸入採算の確認が必要だ。",
        "ドル建て部材の支払い時期を見直す局面だ。",
        "為替変動が調達費と販売価格に同時に波及するため、契約条件と見積もり有効期限を早急に再確認し、財務・調達・販売の各部門が同じ前提レートで採算シナリオを毎週更新し続ける体制づくりが不可欠になる。",
      ],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("指定範囲外")))
})

test("allows takeaways between 50 and 90 characters", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: [
        "ルピー下落で輸入採算の確認が必要になり、ドル建て部材を調達する製造業は支払い時期の再点検を迫られる。",
        "インド準備銀行の市場介入が続く局面では、財務と調達が同じ為替前提を共有して予算を管理する必要がある。",
        "販売契約の価格転嫁条項と見積もり有効期限を見直し、為替変動を部門横断で管理する体制が重要となる。",
      ],
    }),
    cluster,
  )

  assert.equal(qc, null)
})

test("flags takeaway count other than three", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: [
        "ルピー下落で輸入採算の確認が必要だ。",
      ],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("3件")))
})

test("accepts enrichment fields inside their requested ranges", () => {
  const qc = runDeterministicQualityGuard(
    output({
      backgroundContext: "背".repeat(200),
      japanBusinessImpact: "影".repeat(200),
      imageCaption: "写".repeat(40),
      keywords: [
        { term: "EPFO", definition: "定".repeat(50) },
        { term: "PF", definition: "義".repeat(120) },
      ],
    }),
    cluster,
  )

  assert.equal(qc, null)
})

test("accepts the explicit no-direct-impact statement allowed by the prompt", () => {
  const qc = runDeterministicQualityGuard(
    output({
      japanBusinessImpact:
        "現時点で公表されている情報からは、日本企業への直接的な影響は確認できません。",
    }),
    cluster,
  )

  assert.equal(qc, null)
})

test("flags generated enrichment fields outside their requested ranges", () => {
  const qc = runDeterministicQualityGuard(
    output({
      backgroundContext: "背".repeat(140),
      japanBusinessImpact: "影".repeat(251),
      imageCaption: "写".repeat(20),
      keywords: [{ term: "EPFO", definition: "定".repeat(32) }],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("ニュースの背景")))
  assert(qc?.issues.some((issue) => issue.includes("日本企業への影響")))
  assert(qc?.issues.some((issue) => issue.includes("画像キャプション")))
  assert(qc?.issues.some((issue) => issue.includes("キーワード解説")))
})

test("flags a large length gap between background and business impact", () => {
  const qc = runDeterministicQualityGuard(
    output({
      backgroundContext: "背".repeat(240),
      japanBusinessImpact: "影".repeat(170),
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("文字数差")))
})

test("flags unsupported numbers introduced from outside the provided sources", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: validSummary + "インドは過去にイランから原油の約10%を輸入していた。",
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("10")))
})

test("accepts equivalent crore and Japanese oku notation", () => {
  const source: SynthesisSource[] = [{
    source: "PIB",
    sourceUrl: "https://example.com/mpms",
    publishedAt: "2026-07-14",
    title: "Cabinet approves MPMS with Rs 62,500 crore outlay",
    bodyText: "The scheme has an outlay of Rs 62,500 crore and is expected to create 60,000 jobs.",
  }]
  const qc = runDeterministicQualityGuard(
    output({
      title: "インド政府、MPMSに6,250億ルピーを投じる制度案を承認",
      summary: validSummary
        .replaceAll("94.63", "6,250億")
        .replace("インドルピー", "インド政府はMPMSに") + "同制度は6万人の雇用創出を見込む。",
      referenceUrls: [{ title: source[0].title, url: source[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["6,250億ルピー", "6万人"] }],
    }),
    source,
  )

  assert.equal(qc?.issues.some((issue) => issue.includes("6,250")) ?? false, false)
  assert.equal(qc?.issues.some((issue) => issue.includes("6万人")) ?? false, false)
})

test("accepts English per cent values rendered with a Japanese percent sign", () => {
  const percentCluster: SynthesisSource[] = [{
    ...cluster[0],
    bodyText: `${cluster[0].bodyText} The inflation forecast is 5.0-5.2 per cent.`,
  }]
  const qc = runDeterministicQualityGuard(
    output({
      summary: `${validSummary}インフレ率の見通しは5.0〜5.2%である。`,
      referenceUrls: [{ title: percentCluster[0].title, url: percentCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["94.63 per dollar", "5.0-5.2 per cent"] }],
    }),
    percentCluster,
  )

  assert.equal(qc?.issues.some((issue) => issue.includes("5.0")) ?? false, false)
  assert.equal(qc?.issues.some((issue) => issue.includes("5.2")) ?? false, false)
})

test("matches comma-formatted source usage numbers to article text", () => {
  const commaCluster: SynthesisSource[] = [{
    ...cluster[0],
    bodyText: `${cluster[0].bodyText} The programme covers 1,000 biogas plants.`,
  }]
  const qc = runDeterministicQualityGuard(
    output({
      summary: `${validSummary}対象には1,000基のバイオガス設備が含まれる。`,
      referenceUrls: [{ title: commaCluster[0].title, url: commaCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["94.63 per dollar", "1,000 biogas plants"] }],
    }),
    commaCluster,
  )

  assert.equal(
    qc?.issues.some((issue) => issue.includes("生成本文で実質的に使われていない")) ?? false,
    false,
  )
})

test("flags a draft regulation presented without draft status", () => {
  const source: SynthesisSource[] = [{
    source: "RBI",
    sourceUrl: "https://example.com/rbi-draft",
    publishedAt: "2026-07-15",
    title: "RBI issues draft data governance guidance for public comments",
    bodyText: "The Reserve Bank of India released draft guidance for public comments. Regulated entities shall designate accountable officers under the proposed framework.",
  }]
  const qc = runDeterministicQualityGuard(
    output({
      title: "RBIが銀行にデータ統治指針、管理責任を義務付け",
      summary: validSummary,
      category: "regulation",
      referenceUrls: [{ title: source[0].title, url: source[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["draft data governance guidance"] }],
    }),
    source,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("草案・提案")))
})

test("flags future effective dates written as already effective", () => {
  const source: SynthesisSource[] = [{
    source: "Government",
    sourceUrl: "https://example.com/future-fta",
    publishedAt: "2026-07-12",
    title: "India UK trade agreement will enter into force on July 15",
    bodyText: "The agreement will enter into force on July 15 after ratification.",
  }]
  const qc = runDeterministicQualityGuard(
    output({
      title: "印英FTAが発効、関税を撤廃",
      summary: validSummary.replace("インドルピーは", "印英FTAは発効し、"),
      referenceUrls: [{ title: source[0].title, url: source[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["July 15"] }],
    }),
    source,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("将来の発効")))
})

test("flags rupee articles that accidentally use yen-level wording", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: [
        "94円台後半を前提にヘッジ比率を見直す。",
        "ドル建て部材の支払い時期を見直す局面だ。",
        "価格転嫁条件を販売契約と連動させるべきだ。",
      ],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("円台")))
})

test("flags references that are not backed by sourceUsage", () => {
  const qc = runDeterministicQualityGuard(
    output({
      referenceUrls: [
        { title: cluster[0].title, url: cluster[0].sourceUrl },
        { title: cluster[1].title, url: cluster[1].sourceUrl },
      ],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("sourceUsage")))
})

test("does not require exact English sourceUsage names when body uses Japanese wording", () => {
  const qc = runDeterministicQualityGuard(
    output({
      sourceUsage: [{
        sourceIndex: 1,
        factsUsed: ["Reserve Bank of India intervened in the foreign exchange market"],
      }],
    }),
    cluster,
  )

  assert.equal(qc, null)
})

test("deduplicates unused sourceUsage number issues per source", () => {
  const qc = runDeterministicQualityGuard(
    output({
      sourceUsage: [{
        sourceIndex: 1,
        factsUsed: ["94.63 per dollar", "94.63 after intervention"],
      }],
      title: "ルピーが94台まで下落、RBIが外為市場に介入",
      summary: validSummary.replaceAll("94.63", "94"),
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert.equal(
    qc?.issues.filter((issue) => issue.includes("sourceUsage の事実が生成本文")).length,
    1,
  )
})

test("flags concrete names introduced only in implications", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: "第8次給与委員会の勧告時期が前倒しされれば、耐久財消費の回復期待が高まる。",
      implications: [
        "マルチ・スズキの販売金融を点検すべきだ。",
        "二輪需要の回復シナリオを見直す局面だ。",
        "在庫配分を前倒しで確認する必要がある。",
      ],
    }),
    [{
      source: "Mint",
      sourceUrl: "https://example.com/pay",
      publishedAt: "2026-06-24",
      title: "8th Pay Commission may submit recommendations early",
      bodyText: "The 8th Pay Commission may submit recommendations early, with implementation discussed for 2027.",
    }],
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("マルチ・スズキ")))
})

test("rejects meta commentary about insufficient source evidence", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: `${validSummary}なお、参考記事では具体的な数値が確認できないため言及を控える。`,
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REJECT")
  assert(qc?.issues.some((issue) => issue.includes("メタ注釈")))
})

test("flags industry tags that do not match the article topic", () => {
  const qc = runDeterministicQualityGuard(
    output({
      title: "クラウド投資がインドのデータセンター市場を押し上げる",
      summary: validSummary.replaceAll("ルピー", "クラウド"),
      industryTags: ["semiconductor", "machine_tools"],
    }),
    [{
      source: "Example",
      sourceUrl: "https://example.com/cloud",
      publishedAt: "2026-06-25",
      title: "Cloud companies invest in Indian data centres",
      bodyText: "Large technology companies are investing in Indian cloud computing and data centre infrastructure.",
    }],
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("industryTags")))
})

test("flags industry tags outside the allowed taxonomy", () => {
  const qc = runDeterministicQualityGuard(
    output({ industryTags: ["finance"] }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("許可されていないタグ")))
})

test("accepts the energy tag on a crude oil article", () => {
  const oilCluster: SynthesisSource[] = [{
    source: "Times of India",
    sourceUrl: "https://example.com/crude",
    publishedAt: "2026-07-20",
    title: "India's crude oil imports from Russia remain near all-time high",
    bodyText: "India's crude oil imports from Russia stayed near a record high in July despite no sanctions waiver from the United States.",
  }]

  const qc = runDeterministicQualityGuard(
    output({
      title: "インドのロシア原油輸入は高水準",
      summary: validSummary.replaceAll("ルピー", "原油"),
      industryTags: ["energy"],
      referenceUrls: [{ title: oilCluster[0].title, url: oilCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["crude oil imports from Russia"] }],
    }),
    oilCluster,
  )

  assert.equal(qc?.issues.some((issue) => issue.includes("industryTags")) ?? false, false)
})

// --- 数値照合: 単位換算の誤検知 ---------------------------------------------
// 生成記事はインド式表記(crore / lakh crore / billion)を日本式(億 / 兆 / 万)へ
// 換算する。桁ごとに数値を切り出していた頃は「892億4000万」の 4000 が原文に
// 存在しない数値として弾かれ、正しい記事が review に落ちていた。

const numericCluster: SynthesisSource[] = [
  {
    source: "Times of India",
    sourceUrl: "https://example.com/ril",
    publishedAt: "2026-07-17",
    title: "RIL Q1 results",
    bodyText: [
      "Excluding the one-time gain of Rs 8,924 crore from the sale of listed investments,",
      "recurring EBITDA rose 10.1% to a record Rs 54,067 crore.",
      "Capital expenditure stood at Rs 38,682 crore ($4.1 billion).",
      "The O2C business reported revenue of Rs 2.01 lakh crore ($21.3 billion).",
      "Potential inflows were estimated at $60-80 billion.",
      "The fund is worth $3bn and the economy reached $4 trillion.",
    ].join(" "),
  },
]

// summary の文字数ゲートに引っかからない長さまで埋めるためのサンプル長。
const ARTICLE_BODY_MIN_SAMPLE = 440

function numericIssues(summary: string): string[] {
  const qc = runDeterministicQualityGuard(
    output({
      title: "リライアンス決算",
      summary: summary.padEnd(ARTICLE_BODY_MIN_SAMPLE, "。"),
      referenceUrls: [{ title: numericCluster[0].title, url: numericCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["Rs 8,924 crore one-time gain"] }],
      indiaRelevance: { score: 3, reason: "インド企業の決算" },
      japaneseBusinessRelevance: { score: 2, reason: "取引先の業績" },
    }),
    numericCluster,
  )
  return (qc?.issues ?? []).filter((issue) =>
    issue.includes("参考記事本文にない数値")
  )
}

test("accepts a compound Japanese numeral converted from crore", () => {
  assert.deepEqual(numericIssues("一時益は892億4000万ルピーだった"), [])
  assert.deepEqual(numericIssues("EBITDAは5406億7000万ルピーとなった"), [])
})

test("accepts crore and billion converted with rounding", () => {
  assert.deepEqual(numericIssues("設備投資は3868億2000万ルピー(約41億ドル)だった"), [])
})

test("accepts trillion, bn abbreviation and range notation", () => {
  assert.deepEqual(numericIssues("経済規模は4兆ドル、基金は30億ドルに達した"), [])
  assert.deepEqual(numericIssues("当初想定は600億〜800億ドルだった"), [])
})

test("accepts a repeated currency marker in an English range", () => {
  const rangeCluster: SynthesisSource[] = [{
    ...numericCluster[0],
    bodyText: `${numericCluster[0].bodyText} Revised inflows are expected at $50 to $55 billion.`,
  }]
  const qc = runDeterministicQualityGuard(
    output({
      title: "資金流入は当初予想を下回る見込み",
      summary: "資金流入は500億〜550億ドルになる見通しだ".padEnd(
        ARTICLE_BODY_MIN_SAMPLE,
        "。",
      ),
      referenceUrls: [{ title: rangeCluster[0].title, url: rangeCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["500億〜550億ドル"] }],
    }),
    rangeCluster,
  )

  assert.equal(
    qc?.issues.some((issue) => issue.includes("参考記事本文にない数値")) ?? false,
    false,
  )
})

test("still rejects a mis-scaled unit conversion", () => {
  // Rs 38,682 crore は3868億2000万ルピー。386億8200万は10分の1で誤り。
  const issues = numericIssues("設備投資は386億8200万ルピーだった")
  assert.equal(issues.length, 1)
  assert(issues[0].includes("386億8200万"))
})

test("still rejects a mis-scaled dollar conversion", () => {
  // $21.3 billion は213億ドル。21.3億ドルは10分の1で誤り。
  const issues = numericIssues("O2C売上高は21.3億ドルとなった")
  assert.equal(issues.length, 1)
  assert(issues[0].includes("21.3億"))
})

test("still rejects the other mis-scaled crore conversions from the RIL article", () => {
  const issues = numericIssues(
    "設備投資は386億8200万ルピー、小売売上高は900億9000万ルピー、純利益は28億500万ルピーだった",
  )
  assert.equal(issues.length, 3)
  assert(issues.some((issue) => issue.includes("386億8200万")))
  assert(issues.some((issue) => issue.includes("900億9000万")))
  assert(issues.some((issue) => issue.includes("28億500万")))
})

test("does not treat four-digit calendar years as fabricated figures", () => {
  assert.deepEqual(numericIssues("2026年の計画は2030年まで続く"), [])
})

test("still checks abbreviated fiscal years against the source", () => {
  const issues = numericIssues("FY26の計画である")
  assert.equal(issues.length, 1)
  assert(issues[0].includes("26"))
})

test("does not apply currency rounding tolerance to exact counts", () => {
  const countCluster: SynthesisSource[] = [{
    ...numericCluster[0],
    bodyText: `${numericCluster[0].bodyText} The company employs exactly 200 people.`,
  }]
  const qc = runDeterministicQualityGuard(
    output({
      title: "従業員数を公表",
      summary: "従業員は201人である".padEnd(ARTICLE_BODY_MIN_SAMPLE, "。"),
      referenceUrls: [{ title: countCluster[0].title, url: countCluster[0].sourceUrl }],
      sourceUsage: [{ sourceIndex: 1, factsUsed: ["従業員201人"] }],
    }),
    countCluster,
  )
  assert(qc?.issues.some((issue) => issue.includes("201")))
})
