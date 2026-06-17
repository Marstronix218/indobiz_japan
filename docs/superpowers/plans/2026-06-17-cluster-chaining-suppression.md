# クラスタリング連鎖抑制（complete-linkage 化）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `clusterArticles` を single-linkage(union-find) から complete-linkage 凝集法に置換し、橋渡し記事による連鎖（無関係ソースの誤マージ）を構造的に排除する。

**Architecture:** クラスタを「全メンバー対が時間窓内かつ共有キーワード≥閾値＝クリーク」に限定。2クラスタは全クロス対が eligible のときだけ統合（complete-linkage）。最弱リンク最大＋最小index対のタイブレークで決定的。Node 組み込みの `node:test` ＋ `--experimental-strip-types` で本物のユニットテストを付ける（依存追加なし）。

**Tech Stack:** TypeScript / Node v22.17（`node --experimental-strip-types --test`）/ 既存 `lib/clustering.ts` の純関数。

## Global Constraints

- スコープは**クラスタリングのみ**。次は変更しない: 合成プロンプト(`lib/llm/prompt.ts`)、`lib/summary-utils.ts` のフィラー水増し、`ClusterOptions` の項目・既定値、env 変数、`extractKeywords`/STOPWORDS/`readClusterOptionsFromEnv`、`clusterArticles` の入出力シグネチャ、呼び出し側、後段の `dedupe_key`/`DEDUPE_*` ガード。
- 方針: **過剰マージ回避を最優先**。保守的でよく、本来同じ事件の分割（→単一ソース自動却下）は許容。
- `minSharedKeywords` の既定は **2 のまま**（env 変更なし）。
- 戻り値は `RawSourceArticle[][]`。クラスタは最小元index昇順、各クラスタ内メンバーは元index昇順で出力（決定的）。
- 検証は `node --experimental-strip-types --test lib/clustering.test.ts`（全 pass）＋ `./node_modules/.bin/tsc --noEmit`（型エラーなし）。新規依存は入れない（`node:test` は組み込み）。
- コミットメッセージ末尾に必ず付与:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```

---

### Task 1: complete-linkage クラスタリング（TDD・単一タスク）

このタスクは TDD（RED→GREEN）で完結する。テスト基盤の設定（tsconfig / package.json）も deliverable に必要なため本タスクに含める。

**Files:**
- Modify: `tsconfig.json`（`compilerOptions` に1行追加）
- Modify: `package.json`（`scripts` に1行追加）
- Create: `lib/clustering.test.ts`（新規ユニットテスト）
- Modify: `lib/clustering.ts`（`clusterArticles` の内部を置換、`UnionFind` クラスを削除）

**Interfaces:**
- Consumes: `extractKeywords(title: string, body: string, n: number): string[]` と `parsePublishedAt(value: string): number`（いずれも `lib/clustering.ts` 内に既存。後者は引き続き使用）。`ClusterOptions { minSharedKeywords: number; windowHours: number; keywordsPerArticle: number }`（既存 export）。`RawSourceArticle`（`lib/automation.ts`、必須: `connectorId, externalId, source, title, url, publishedAt, bodyText`）。
- Produces: `clusterArticles(raws: RawSourceArticle[], opts: ClusterOptions): RawSourceArticle[][]`（シグネチャ不変。内部のみ complete-linkage 化）。

- [ ] **Step 1: tsconfig に `allowImportingTsExtensions` を追加**

理由: テストは Node の型ストリップ実行のため `import { clusterArticles } from "./clustering.ts"` と**拡張子付き**で書く必要があり、tsc がこれを許可するには本オプションが要る（`noEmit: true` 環境でのみ有効、本リポジトリは該当）。

`tsconfig.json` の `compilerOptions` 内、`"isolatedModules": true,` の直後に1行追加する。変更前:

```json
    "isolatedModules": true,
    "jsx": "react-jsx",
```

変更後:

```json
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "jsx": "react-jsx",
```

- [ ] **Step 2: package.json にテストスクリプトを追加**

`package.json` の `"scripts"` に `test:clustering` を追加する。例（既存の `scripts` ブロックに1エントリ足すだけ。末尾カンマに注意）:

```json
    "test:clustering": "node --experimental-strip-types --test lib/clustering.test.ts"
```

- [ ] **Step 3: 失敗するテストを書く（`lib/clustering.test.ts` 新規作成）**

合成データで連鎖・再現・リグレッション・時間窓・決定性を検証する。トークンはすべて3文字以上・非ストップワード・小文字（固有名詞ブースト無し）で、共有キーワード数を厳密に制御している。

```ts
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
```

- [ ] **Step 4: テストを実行して RED を確認**

Run: `node --experimental-strip-types --test lib/clustering.test.ts`
Expected: **2 件失敗、3 件成功**。失敗するのは現行 single-linkage で連鎖が起きるため:
- `does not chain A-B-C ...` → 失敗（現状 X と Z が同一クラスタになる）
- `real-case repro ...` → 失敗（現状 I1 と V1 が橋渡し BR 経由で同一クラスタになる）

成功するのは `genuine duplicate ...` / `time window ...` / `deterministic ...` の3件。

- [ ] **Step 5: `clusterArticles` を complete-linkage に置換し、`UnionFind` を削除**

`lib/clustering.ts` の `UnionFind` クラス（`class UnionFind { ... }` ブロック全体）を**削除**する。`parsePublishedAt` 関数は残す。次に `clusterArticles` 関数の本体（`export function clusterArticles(` から対応する閉じ `}` まで）を以下で**丸ごと置換**する:

```ts
export function clusterArticles(
  raws: RawSourceArticle[],
  opts: ClusterOptions,
): RawSourceArticle[][] {
  if (raws.length === 0) return []

  const { minSharedKeywords, windowHours, keywordsPerArticle } = opts
  const windowMs = windowHours * 60 * 60 * 1000
  const n = raws.length

  const indexed = raws.map((article) => ({
    keywords: new Set(
      extractKeywords(article.title, article.bodyText ?? "", keywordsPerArticle),
    ),
    publishedMs: parsePublishedAt(article.publishedAt),
  }))

  // Pairwise eligibility (time window + shared-keyword threshold) and the full
  // shared-keyword count (needed as the complete-linkage strength / tie-break).
  const eligible: boolean[][] = Array.from({ length: n }, () =>
    new Array<boolean>(n).fill(false),
  )
  const sharedCount: number[][] = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const timeOk =
        Math.abs(indexed[i].publishedMs - indexed[j].publishedMs) <= windowMs
      let shared = 0
      if (timeOk) {
        for (const kw of indexed[i].keywords) {
          if (indexed[j].keywords.has(kw)) shared++
        }
      }
      eligible[i][j] = eligible[j][i] = timeOk && shared >= minSharedKeywords
      sharedCount[i][j] = sharedCount[j][i] = shared
    }
  }

  // Greedy complete-linkage agglomeration. Each cluster is a clique in which
  // every member pair is eligible. Two clusters merge only when ALL cross-pairs
  // are eligible, so a bridge article cannot chain two otherwise-unrelated
  // groups. Among mergeable pairs, pick the largest weakest-link (min shared
  // across cross-pairs); break ties by smallest member indices for determinism.
  let clusters: number[][] = raws.map((_, i) => [i])

  for (;;) {
    let best: { a: number; b: number; linkage: number } | null = null
    for (let a = 0; a < clusters.length; a++) {
      for (let b = a + 1; b < clusters.length; b++) {
        let mergeable = true
        let minShared = Infinity
        for (const ia of clusters[a]) {
          for (const ib of clusters[b]) {
            if (!eligible[ia][ib]) {
              mergeable = false
              break
            }
            if (sharedCount[ia][ib] < minShared) minShared = sharedCount[ia][ib]
          }
          if (!mergeable) break
        }
        if (!mergeable) continue
        if (
          best === null ||
          minShared > best.linkage ||
          (minShared === best.linkage &&
            (clusters[a][0] < clusters[best.a][0] ||
              (clusters[a][0] === clusters[best.a][0] &&
                clusters[b][0] < clusters[best.b][0])))
        ) {
          best = { a, b, linkage: minShared }
        }
      }
    }
    if (best === null) break
    const merged = [...clusters[best.a], ...clusters[best.b]].sort((x, y) => x - y)
    clusters[best.a] = merged
    clusters.splice(best.b, 1)
  }

  clusters.sort((c1, c2) => c1[0] - c2[0])
  return clusters.map((members) => members.map((i) => raws[i]))
}
```

注意: `clusters` は `const` ではなく `let`（`splice` で要素を抜くが再代入はしないので `const` でも可。上記は `let`）。`UnionFind` 削除後、`lib/clustering.ts` 内に `UnionFind` への参照が残っていないことを確認する。

- [ ] **Step 6: テストを実行して GREEN を確認**

Run: `node --experimental-strip-types --test lib/clustering.test.ts`
Expected: **5 件すべて成功**（`# pass 5` / `# fail 0`）、出力にスタックトレース等のノイズなし。

- [ ] **Step 7: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなしで終了（終了コード 0）。

- [ ] **Step 8: コミット**

```bash
git add tsconfig.json package.json lib/clustering.ts lib/clustering.test.ts
git commit -m "$(cat <<'EOF'
feat: complete-linkage clustering to suppress chaining

Replace single-linkage union-find with greedy complete-linkage so a
bridge article can no longer chain unrelated source groups into one
cluster. Add node:test unit tests (no new deps).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**1. Spec coverage:**
- セクション1（アルゴリズム: complete-linkage / クリーク / eligible 定義）→ Task 1 Step 5。✓
- セクション2（決定性・出力契約・O(n³)）→ Step 5 のタイブレーク＋最終ソート。✓
- セクション3（挙動変化: 連鎖排除・時間窓全ペア適用・既定2維持・debugClusterDetails 自動追従）→ Step 5（debugClusterDetails は内部で clusterArticles を呼ぶため変更不要、本計画でも非変更）。✓
- セクション4（node:test の5シナリオ、test:clustering スクリプト）→ Step 2/3/4/6。✓
- 影響ファイル（clustering.ts / clustering.test.ts / package.json）に加え、`.ts` 拡張子 import を tsc が許可するための tsconfig 変更を Step 1 で追加（spec の検証要件を満たすための必要設定）。✓

**2. Placeholder scan:** TBD/TODO/「適切に処理」等なし。全コード手順に完全なコードを記載。✓

**3. Type consistency:**
- `clusterArticles(raws, opts): RawSourceArticle[][]` はシグネチャ不変。テストは `Parameters<typeof clusterArticles>[0][number]` で要素型を導出し `RawSourceArticle` を直接 import しない（automation.ts を実行時に読ませない）。✓
- `ClusterOptions` は `lib/clustering.ts` の既存 export を type import。フィールド名 `minSharedKeywords/windowHours/keywordsPerArticle` は spec と一致。✓
- `extractKeywords` / `parsePublishedAt` のシグネチャは既存どおり使用。✓
