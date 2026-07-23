import { test } from "node:test"
import assert from "node:assert/strict"
import {
  buildDedupeSourceUrls,
  hasSharedDedupeSourceUrl,
} from "./dedupe-source-url.ts"

test("normalizes tracking parameters and trailing slashes", () => {
  const urls = buildDedupeSourceUrls([
    "https://example.com/story/?utm_source=rss#section",
    "https://example.com/story",
  ])
  assert.deepEqual([...urls], ["https://example.com/story"])
})

test("detects the same source URL regardless of article category", () => {
  const first = buildDedupeSourceUrls([
    "https://jbpress.ismedia.jp/articles/-/96035",
  ])
  const second = buildDedupeSourceUrls([
    "https://jbpress.ismedia.jp/articles/-/96035?utm_medium=referral",
  ])
  assert.equal(hasSharedDedupeSourceUrl(first, second), true)
})

test("does not merge genuinely different source URLs", () => {
  const first = buildDedupeSourceUrls(["https://example.com/story-a"])
  const second = buildDedupeSourceUrls(["https://example.com/story-b"])
  assert.equal(hasSharedDedupeSourceUrl(first, second), false)
})
