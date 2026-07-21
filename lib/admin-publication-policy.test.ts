import { test } from "node:test"
import assert from "node:assert/strict"
import { getAdminPublicationBlock } from "./admin-publication-policy.ts"

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
