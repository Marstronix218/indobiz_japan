import assert from "node:assert/strict"
import { test } from "node:test"
import {
  X_MAX_WEIGHTED_LENGTH,
  composeXPost,
  jstDateKey,
  truncateToWeight,
  xWeightedLength,
} from "./x-text.ts"

test("weights latin as 1, Japanese as 2, URLs as 23", () => {
  assert.equal(xWeightedLength("abc"), 3)
  assert.equal(xWeightedLength("インド"), 6)
  assert.equal(xWeightedLength("https://example.com/a/very/long/path/that/is/long"), 23)
  assert.equal(xWeightedLength("見て https://example.com"), 2 + 2 + 1 + 23)
})

test("truncateToWeight keeps within budget and adds an ellipsis", () => {
  const out = truncateToWeight("あいうえおかきくけこ", 10)
  assert.equal(out, "あいうえ…")
  assert.ok(xWeightedLength(out) <= 10)
  assert.equal(truncateToWeight("short", 10), "short")
})

const URL = "https://indobiz-japan.launchers-g.com/article/0b7c1e1c-1111-2222-3333-444455556666/india-semiconductor-packaging"

test("short post keeps every part", () => {
  const text = composeXPost({
    title: "インド政府、半導体支援の第2弾",
    categoryLabel: "経済",
    lead: "後工程の支援が焦点。",
    url: URL,
  })
  assert.equal(
    text,
    `【経済】インド政府、半導体支援の第2弾\n\n後工程の支援が焦点。\n\n#インド #インドビジネス\n${URL}`,
  )
})

test("long lead is truncated but title, hashtags and URL survive", () => {
  const text = composeXPost({
    title: "インド準備銀行が政策金利を据え置き、インフレ見通しを上方修正",
    categoryLabel: "経済",
    lead: "あ".repeat(300),
    url: URL,
  })
  assert.ok(xWeightedLength(text) <= X_MAX_WEIGHTED_LENGTH, `got ${xWeightedLength(text)}`)
  assert.ok(text.startsWith("【経済】インド準備銀行が"))
  assert.ok(text.includes("…"))
  assert.ok(text.endsWith(URL))
  assert.ok(text.includes("#インドビジネス"))
})

test("absurdly long title is truncated and the lead dropped", () => {
  const text = composeXPost({
    title: "見".repeat(200),
    categoryLabel: "社会・文化",
    lead: "ポイント",
    url: URL,
  })
  assert.ok(xWeightedLength(text) <= X_MAX_WEIGHTED_LENGTH)
  assert.ok(!text.includes("ポイント"))
  assert.ok(text.endsWith(URL))
})

test("long title without a category label still fits", () => {
  const text = composeXPost({ title: "あ".repeat(200), url: URL })
  assert.ok(xWeightedLength(text) <= X_MAX_WEIGHTED_LENGTH, `got ${xWeightedLength(text)}`)
  assert.ok(text.endsWith(URL))
})

test("jstDateKey rolls over at 15:00 UTC", () => {
  assert.equal(jstDateKey(new Date("2026-11-23T14:59:59Z")), "2026-11-23")
  assert.equal(jstDateKey(new Date("2026-11-23T15:00:00Z")), "2026-11-24")
  assert.equal(jstDateKey(new Date("2026-11-23T22:05:00Z")), "2026-11-24")
})
