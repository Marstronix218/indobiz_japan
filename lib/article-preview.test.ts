import assert from "node:assert/strict"
import { test } from "node:test"
import { toArticlePreview } from "./article-preview.ts"
import type { NewsArticle } from "./news-data.ts"

const article: NewsArticle = {
  id: "article-1",
  title: "テスト記事",
  summary: "要".repeat(300),
  source: "Source",
  sourceUrl: "https://example.com/full",
  publishedAt: "2026-07-23T00:00:00.000Z",
  category: "economy",
  industryTags: [],
  implications: ["会員向けの示唆"],
  contentType: "news",
  visibility: "public",
  workflowStatus: "published",
  backgroundContext: "会員向けの背景",
  japanBusinessImpact: "会員向けの影響",
  keywords: [{ term: "用語", definition: "会員向けの解説" }],
  provenance: {
    originalTitle: "Original",
    originalUrl: "https://example.com/original",
  },
  sources: [
    {
      originalTitle: "Original",
      originalUrl: "https://example.com/original",
    },
  ],
}

test("public preview strips member-only article content", () => {
  const preview = toArticlePreview(article)

  assert.equal(preview.summary.length, 160)
  assert.deepEqual(preview.implications, [])
  assert.equal(preview.sourceUrl, undefined)
  assert.equal(preview.backgroundContext, undefined)
  assert.equal(preview.japanBusinessImpact, undefined)
  assert.equal(preview.keywords, undefined)
  assert.equal(preview.provenance, undefined)
  assert.equal(preview.sources, undefined)
  assert.equal(preview.title, article.title)
})
