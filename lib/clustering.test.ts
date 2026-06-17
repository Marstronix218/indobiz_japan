import { test } from "node:test"
import assert from "node:assert/strict"
import { clusterArticles, type ClusterOptions } from "./clustering.ts"

type Raw = Parameters<typeof clusterArticles>[0][number]

const OPTS: ClusterOptions = {
  minSharedKeywords: 2,
  windowHours: 48,
  keywordsPerArticle: 20,
}

const DAY = "2026-06-15T00:00:00.000Z"

function mk(externalId: string, tokens: string[], publishedAt = DAY): Raw {
  const text = tokens.join(" ")
  return {
    connectorId: "test",
    externalId,
    source: externalId,
    title: text,
    url: `https://example.test/${externalId}`,
    publishedAt,
    bodyText: text,
  }
}

function clusterIds(raws: Raw[], opts: ClusterOptions = OPTS): string[][] {
  return clusterArticles(raws, opts).map((c) => c.map((a) => a.externalId).sort())
}

function sameCluster(
  raws: Raw[],
  idA: string,
  idB: string,
  opts: ClusterOptions = OPTS,
): boolean {
  for (const c of clusterArticles(raws, opts)) {
    const ids = new Set(c.map((a) => a.externalId))
    if (ids.has(idA) && ids.has(idB)) return true
  }
  return false
}

test("does not chain A-B-C when A and C share nothing", () => {
  // X~Y share {alpha,bravo}=2; Y~Z share {xray,yankee}=2; X~Z share 0.
  const X = mk("X", ["alpha", "bravo", "xx1", "xx2"])
  const Y = mk("Y", ["alpha", "bravo", "xray", "yankee"])
  const Z = mk("Z", ["xray", "yankee", "zz1", "zz2"])
  // single-linkage would chain all three; complete-linkage must not.
  assert.equal(sameCluster([X, Y, Z], "X", "Z"), false)
})

test("real-case repro: inflation source and trade-visit source never co-cluster", () => {
  const I1 = mk("I1", ["alpha", "bravo", "charlie", "iu1"])
  const I2 = mk("I2", ["alpha", "bravo", "charlie", "iu2"])
  const V1 = mk("V1", ["xray", "yankee", "zulu", "vu1"])
  const V2 = mk("V2", ["xray", "yankee", "zulu", "vu2"])
  const BR = mk("BR", ["alpha", "bravo", "xray", "yankee"]) // bridges both groups
  const raws = [I1, I2, V1, V2, BR]
  assert.equal(sameCluster(raws, "I1", "V1"), false)
  assert.equal(sameCluster(raws, "I2", "V2"), false)
  // genuine same-topic pairs still merge
  assert.equal(sameCluster(raws, "I1", "I2"), true)
  assert.equal(sameCluster(raws, "V1", "V2"), true)
})

test("genuine duplicate (2 sources, shared >= threshold, in window) merges", () => {
  const A = mk("A", ["alpha", "bravo", "charlie", "auu"])
  const B = mk("B", ["alpha", "bravo", "charlie", "buu"])
  assert.equal(sameCluster([A, B], "A", "B"), true)
  assert.equal(clusterArticles([A, B], OPTS).length, 1)
})

test("articles outside the time window do not merge despite high overlap", () => {
  const A = mk("A", ["alpha", "bravo", "charlie"], "2026-06-10T00:00:00.000Z")
  const B = mk("B", ["alpha", "bravo", "charlie"], "2026-06-15T00:00:00.000Z") // 5 days > 48h
  assert.equal(sameCluster([A, B], "A", "B"), false)
})

test("clustering is deterministic across runs", () => {
  const raws = [
    mk("I1", ["alpha", "bravo", "charlie", "iu1"]),
    mk("I2", ["alpha", "bravo", "charlie", "iu2"]),
    mk("V1", ["xray", "yankee", "zulu", "vu1"]),
    mk("V2", ["xray", "yankee", "zulu", "vu2"]),
    mk("BR", ["alpha", "bravo", "xray", "yankee"]),
  ]
  const first = JSON.stringify(clusterIds(raws))
  for (let i = 0; i < 5; i++) {
    assert.equal(JSON.stringify(clusterIds(raws)), first)
  }
})
