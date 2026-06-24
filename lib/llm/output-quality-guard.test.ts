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

function output(overrides: Partial<SynthesisOutput>): SynthesisOutput {
  return {
    title: "ルピーが94.63まで下落、RBIが外為市場に介入",
    summary: "インドルピーは1ドル＝94.63ルピーまで下落し、インド準備銀行が外為市場で介入した。輸入企業にはドル建てコストの上振れが意識される局面である。",
    implications: [
      "94ルピー台までの下落は輸入採算と短期資金繰りに波及するため、日系製造業はドル建て部材の支払い時期とヘッジ比率を今週中に見直し、価格転嫁条件を販売契約と連動させる必要がある。調達、財務、営業が同じ前提レートで判断することが重要である。",
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

test("flags unsupported numbers introduced from outside the provided sources", () => {
  const qc = runDeterministicQualityGuard(
    output({
      summary: "インドは過去にイランから原油の約10%を輸入していたが、今回の協議進展で製造コストに影響する可能性がある。",
    }),
    cluster,
  )

  assert.equal(qc?.verdict, "REVISION")
  assert(qc?.issues.some((issue) => issue.includes("10")))
})

test("flags rupee articles that accidentally use yen-level wording", () => {
  const qc = runDeterministicQualityGuard(
    output({
      implications: ["ルピー安が輸入採算に影響するため、94円台後半を前提にヘッジ比率と価格転嫁条件を見直す必要がある。"],
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
        "所得増が乗用車と二輪の買い替え需要に波及するため、マルチ・スズキとホンダ系ディーラー網を持つ日系企業は販売金融と在庫配分を前倒しで見直す必要がある。",
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
