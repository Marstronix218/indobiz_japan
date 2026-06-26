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
      "ルピー下落で輸入採算の確認が必要だ。",
      "ドル建て部材の支払い時期を見直す局面だ。",
      "価格転嫁条件を販売契約と連動させるべきだ。",
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

test("flags takeaways longer than 50 characters", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: [
        "ルピー下落で輸入採算の確認が必要だ。",
        "ドル建て部材の支払い時期を見直す局面だ。",
        "為替変動が調達費と販売価格に同時に波及するため契約条件と見積もり有効期限を早急に再確認する必要がある。",
      ],
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("50字")))
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
