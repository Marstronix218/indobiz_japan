import { test } from "node:test"
import assert from "node:assert/strict"
import {
  getAdminPublicationBlock,
  hasArticleContentChanges,
  isPublicationTransition,
} from "./admin-publication-policy.ts"

const CURRENT_ARTICLE = {
  title: "Title",
  summary: "Summary",
  source: "Editorial",
  sourceUrl: "https://example.com/source",
  publishedAt: "2026-07-30T00:00:00.000Z",
  category: "column",
  industryTags: ["economy"],
  implications: ["Point"],
  imageCaption: undefined,
  backgroundContext: "Background",
  japanBusinessImpact: "Impact",
  keywords: [{ term: "FDI", definition: "Investment" }],
}

test("treats an edit that remains published as an update, not a publication", () => {
  assert.equal(isPublicationTransition("published", "published"), false)
  assert.equal(isPublicationTransition("review", "published"), true)
})

test("does not invalidate quality when a full form resubmits unchanged content", () => {
  assert.equal(hasArticleContentChanges(CURRENT_ARTICLE, { ...CURRENT_ARTICLE }), false)
  assert.equal(
    hasArticleContentChanges(
      { ...CURRENT_ARTICLE, keywords: undefined },
      { ...CURRENT_ARTICLE, keywords: [] },
    ),
    false,
  )
})

test("detects an actual editorial change while ignoring non-content updates", () => {
  assert.equal(
    hasArticleContentChanges(CURRENT_ARTICLE, { title: "Updated title" }),
    true,
  )
  assert.equal(hasArticleContentChanges(CURRENT_ARTICLE, {}), false)
})

test("requires an explicit override for synthesized articles without PASS", () => {
  assert.deepEqual(
    getAdminPublicationBlock({
      isSynthesized: true,
      qualityVerdict: "REVISION",
      imageUrl: "https://example.com/image.jpg",
      qualityOverrideConfirmed: false,
    }),
    {
      code: "QUALITY_OVERRIDE_REQUIRED",
      error: "AI品質チェックの指摘があります。確認後に再度公開してください",
    },
  )
})

test("never permits a REJECT override", () => {
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: true,
      qualityVerdict: "REJECT",
      imageUrl: "https://example.com/image.jpg",
      qualityOverrideConfirmed: true,
    })?.code,
    "QUALITY_REJECTED",
  )
})

test("allows a REVISION override only when an image exists", () => {
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: true,
      qualityVerdict: "REVISION",
      qualityOverrideConfirmed: true,
    })?.code,
    "IMAGE_REQUIRED",
  )
})

test("requires a quality check before synthesized publication", () => {
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: true,
      imageUrl: "https://example.com/image.jpg",
      qualityOverrideConfirmed: true,
    })?.code,
    "QUALITY_CHECK_REQUIRED",
  )
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: true,
      qualityVerdict: "UNKNOWN",
      imageUrl: "https://example.com/image.jpg",
      qualityOverrideConfirmed: true,
    })?.code,
    "QUALITY_CHECK_REQUIRED",
  )
})

test("keeps the normal PASS path and manual articles working", () => {
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: true,
      qualityVerdict: "PASS",
      imageUrl: "https://example.com/image.jpg",
      qualityOverrideConfirmed: false,
    }),
    null,
  )
  assert.equal(
    getAdminPublicationBlock({
      isSynthesized: false,
      qualityOverrideConfirmed: false,
    }),
    null,
  )
})
