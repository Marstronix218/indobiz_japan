import assert from "node:assert/strict"
import test from "node:test"

import { articlePath, buildArticleSlug } from "./article-slug.ts"
import type { NewsArticle } from "./news-data.ts"

function article(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    title: "インド政府、半導体パッケージ支援の第2弾を準備",
    summary: "要約",
    source: "Economic Times",
    publishedAt: "2026-08-25T00:00:00.000Z",
    category: "economy",
    industryTags: [],
    implications: [],
    contentType: "news",
    visibility: "public",
    workflowStatus: "published",
    ...overrides,
  }
}

function withSourceTitle(originalTitle: string): NewsArticle {
  return article({
    provenance: { originalTitle, originalUrl: "https://example.com/a" },
    sources: [{ originalTitle, originalUrl: "https://example.com/a" }],
  })
}

test("英語ソース見出しから機能語を落としたスラッグを作る", () => {
  const slug = buildArticleSlug(
    withSourceTitle("India readies a second semiconductor packaging tranche"),
  )
  assert.equal(slug, "india-readies-second-semiconductor-packaging-tranche")
})

test("見出し末尾の媒体名を落とす", () => {
  const slug = buildArticleSlug(
    withSourceTitle("Tata Sons board meeting likely in September - Times of India"),
  )
  assert.ok(!slug.includes("times"))
  assert.ok(slug.startsWith("tata-sons-board-meeting"))
})

test("同じ記事からは常に同じスラッグが出る", () => {
  const input = withSourceTitle("RBI forex swap window draws bids")
  assert.equal(buildArticleSlug(input), buildArticleSlug(input))
})

test("日本語見出しのラテン文字語を拾う", () => {
  const slug = buildArticleSlug(
    article({ title: "インドのGST改正でEV調達に影響" }),
  )
  assert.equal(slug, "gst-ev")
})

test("意味のある語が無ければスラッグを付けない", () => {
  // 日本語ソース(NHKなど)の見出しは「17日」しか取れずURLの役に立たない。
  const slug = buildArticleSlug(withSourceTitle("17日 インド経済の現状"))
  assert.equal(slug, "")
  assert.equal(
    articlePath(withSourceTitle("17日 インド経済の現状")),
    "/article/11111111-2222-3333-4444-555555555555",
  )
})

test("スラッグ長は上限内に収まる", () => {
  const slug = buildArticleSlug(
    withSourceTitle(
      "Foreign portfolio investors pour massive amounts into Indian equity markets during volatile trading sessions",
    ),
  )
  assert.ok(slug.length <= 70, slug)
  assert.ok(!slug.endsWith("-"))
})

test("確定済みのslugを優先し、UUIDの後ろに付ける", () => {
  const path = articlePath(article({ slug: "fixed-slug" }))
  assert.equal(path, "/article/11111111-2222-3333-4444-555555555555/fixed-slug")
})
