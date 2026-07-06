#!/usr/bin/env node
// Unit test for lib/home-selection.ts pure selectors.
// Run: node --experimental-strip-types scripts/test-home-selection.mjs
import assert from "node:assert"
import {
  selectImportantNews,
  mergeRankedArticles,
} from "../lib/home-selection.ts"

const NOW = Date.parse("2026-07-06T00:00:00Z")
const hoursAgo = (h) => new Date(NOW - h * 3600_000).toISOString()

// Deterministic stub scorer: featured articles rank above non-featured;
// ties broken by recency (newer = higher). Independent of the real
// computePopularityScore so this test exercises only selection/merge logic.
const scoreOf = (a, now) =>
  (a.featured ? 1_000_000 : 0) + Date.parse(a.createdAt ?? a.publishedAt)

function make(id, opts = {}) {
  return {
    id,
    title: `t-${id}`,
    publishedAt: opts.at ?? hoursAgo(1),
    createdAt: opts.at ?? hoursAgo(1),
    category: opts.category ?? "economy",
    featured: opts.featured ?? false,
  }
}

// selectImportantNews: only last-24h articles, score-ordered, capped.
{
  const recentFeatured = make("a", { at: hoursAgo(2), featured: true })
  const recentPlain = make("b", { at: hoursAgo(3) })
  const old = make("c", { at: hoursAgo(50) })
  const out = selectImportantNews(
    [recentPlain, recentFeatured, old],
    NOW,
    4,
    scoreOf,
  )
  assert.equal(out[0].id, "a", "featured recent should rank first")
  assert.ok(out.some((x) => x.id === "b"), "recent plain included")
  // Only 2 within 24h, limit 4 → fills with old article, total 3
  assert.equal(out.length, 3, "fills from outside 24h up to available")
  assert.equal(out[2].id, "c", "old article backfills last")
}

// Out-of-window high-score article must be EXCLUDED when the 24h window
// already fills `limit` — a naive global score-sort would wrongly include it.
{
  const winA = make("wa", { at: hoursAgo(2) })
  const winB = make("wb", { at: hoursAgo(3) })
  const oldHot = make("oh", { at: hoursAgo(50), featured: true }) // huge stub score
  const out = selectImportantNews([oldHot, winA, winB], NOW, 2, scoreOf)
  assert.equal(out.length, 2, "capped at limit")
  assert.ok(
    !out.some((x) => x.id === "oh"),
    "high-score out-of-window article excluded when window fills limit",
  )
}

// mergeRankedArticles: ranked order first, then backfill by score, no dupes.
{
  const a = make("a", { featured: true })
  const b = make("b")
  const cc = make("c")
  const merged = mergeRankedArticles(["c", "missing"], [a, b, cc], 3, scoreOf)
  assert.equal(merged[0].id, "c", "ranked id comes first")
  assert.equal(merged.length, 3, "backfills to limit")
  assert.equal(new Set(merged.map((x) => x.id)).size, 3, "no duplicates")
  assert.ok(!merged.slice(1).some((x) => x.id === "c"), "no dup of ranked id")
}

// Ranked order is preserved for matched ids even when a later id outscores
// an earlier one (backfill-by-score must not reorder the ranked prefix).
{
  const a = make("a", { featured: true }) // high stub score
  const b = make("b")
  const merged = mergeRankedArticles(["b", "a"], [a, b], 2, scoreOf)
  assert.equal(merged[0].id, "b", "ranked order preserved even when a outscores b")
  assert.equal(merged[1].id, "a", "second ranked id follows")
}

console.log("PASS home-selection")
