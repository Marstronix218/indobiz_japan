import { test } from "node:test"
import assert from "node:assert/strict"
import {
  normalizeSourceTitle,
  sanitizeReferenceUrls,
} from "./source-policy.ts"
import type { SynthesisInput } from "./types.ts"

const input: SynthesisInput = {
  cluster: [
    {
      source: "Reuters",
      sourceUrl: "https://example.com/rupee?utm_source=newsletter",
      publishedAt: "2026-06-22",
      title: "Rupee falls to 94.63 as RBI intervenes - Reuters",
      bodyText: "The rupee fell to 94.63 per dollar.",
    },
    {
      source: "Google News",
      sourceUrl: "https://news.google.com/articles/duplicate",
      publishedAt: "2026-06-22",
      title: "Rupee falls to 94.63 as RBI intervenes | Reuters",
      bodyText: "The rupee fell to 94.63 per dollar.",
    },
    {
      source: "Other",
      sourceUrl: "https://example.com/quantum",
      publishedAt: "2026-06-22",
      title: "Trump promotes quantum computing",
      bodyText: "An unrelated event.",
    },
  ],
}

test("normalizes publisher suffixes for duplicate article detection", () => {
  assert.equal(
    normalizeSourceTitle(input.cluster[0].title),
    normalizeSourceTitle(input.cluster[1].title),
  )
})

test("uses explicit sourceUsage and removes duplicate references", () => {
  const references = sanitizeReferenceUrls(
    input.cluster.map((source) => ({ title: source.title, url: source.sourceUrl })),
    input,
    [
      { sourceIndex: 1, factsUsed: ["94.63 per dollar"] },
      { sourceIndex: 2, factsUsed: ["94.63 per dollar"] },
    ],
  )
  assert.deepEqual(references, [
    {
      title: input.cluster[0].title,
      url: input.cluster[0].sourceUrl,
    },
  ])
})

test("empty model references fall back to the primary source only", () => {
  assert.deepEqual(sanitizeReferenceUrls([], input), [
    {
      title: input.cluster[0].title,
      url: input.cluster[0].sourceUrl,
    },
  ])
})
