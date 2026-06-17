# クラスタリング連鎖抑制（complete-linkage 化）設計書

- 日付: 2026-06-17
- ステータス: 承認済み（実装計画待ち）

## 背景・問題

パイプラインは、スクレイプした生記事（`RawSourceArticle[]`）を「同一ニュースか」で束ね（クラスタリング）、各クラスタを1記事に合成する。現在の `clusterArticles`（[lib/clustering.ts](../../../lib/clustering.ts)）は **single-linkage（単連結）+ union-find** で、ペアが1組でも `minSharedKeywords`（既定2）以上一致すれば結合し、推移的に連鎖（chaining）する。

実例（記事 `bd2cfbaf-08bf-4f5a-b926-7e16fb787dd0`）では、本来無関係な3トピック（①WPIインフレ9.68%、②USTR/グリア訪印の通商協議、③貿易赤字縮小）が1記事に合体した。タイトルのみの実測では「インフレ群×訪印群」の共有キーワードは **0** で、橋渡し記事（③貿易赤字: 訪印群と `talks`、インフレ群と `indias` を各1語共有）を介した**本文経由の連鎖**で全5ソースが1クラスタに collapse したと判断される。

## 目的

クラスタリング段階で**連鎖を構造的に排除**し、無関係なソースが同一クラスタに入らないようにする。スコープは**クラスタリング（どのソースを束ねるか）のみ**。合成（主軸＋肉付け）や本文フィラー水増し（`ensureMinimumSummaryLength`）は対象外。

## 方針の前提（合意済み）

- **過剰マージ回避を最優先**。保守的でよく、まれに本来同じ事件が分割され単一ソース自動却下で落ちても許容する。
- 単一ソースクラスタは著作権安全のため後段で自動却下される（既存仕様）。本変更でその仕様は変えない。

## スコープ外（変更しないもの）

- 合成プロンプト（[lib/llm/prompt.ts](../../../lib/llm/prompt.ts)）と synthesize の挙動。
- 本文フィラー水増し（[lib/summary-utils.ts](../../../lib/summary-utils.ts) の `ensureMinimumSummaryLength`）。
- `ClusterOptions` の項目・既定値（`minSharedKeywords=2`, `windowHours=48`, `keywordsPerArticle=20`）と env 変数。
- `extractKeywords`、STOPWORDS、`readClusterOptionsFromEnv`。
- 呼び出し側（`lib/automation.ts`、`app/api/cron/scrape`、`app/api/experiments/ab-synthesis`）と `clusterArticles` の入出力シグネチャ。
- 後段の `dedupe_key` 一意制約、`DEDUPE_*` 近傍重複ガード。

## アーキテクチャ

### 1. アルゴリズム：貪欲 complete-linkage 凝集法

`clusterArticles` の内部実装を、union-find（single-linkage）から**貪欲な complete-linkage 凝集クラスタリング**に置換する。シグネチャ・戻り値は不変（`(raws, opts) => RawSourceArticle[][]`）。

定義：2記事 i, j が**eligible**であるとは
```
eligible(i, j) ⇔ |publishedMs_i − publishedMs_j| ≤ windowMs
              かつ sharedKeywords(i, j) ≥ minSharedKeywords
```
ここで `sharedKeywords(i,j)` は両者の抽出キーワード集合（`extractKeywords(title, bodyText, keywordsPerArticle)`）の積集合サイズ。

手順：
1. `indexed[i] = { article, keywords: Set<string>, publishedMs }` を構築（現状どおり）。`publishedMs` は `parsePublishedAt` を使用。
2. 全ペア (i<j) について `eligible(i,j)`（boolean）と `sharedKeywords(i,j)`（数）を事前計算。
3. 各記事を単独クラスタ（メンバー＝自分のindexのみ）として開始。
4. 反復統合：
   - 統合可能なクラスタ対 (A, B) ＝ **A の全メンバー a と B の全メンバー b について eligible(a,b) が成立**するもの（complete-linkage）。
   - 統合可能対の中から **linkage = min over (a,b) of sharedKeywords(a,b)（最弱リンク）が最大**の対を選んで統合。
   - 同点タイブレーク：`(min index of A, min index of B)` の昇順で最小の対。
   - 統合可能対が無くなったら終了。
5. 各クラスタは「全ペアが互いに eligible ＝クリーク」になる（帰納的に保証：単独は自明、全クロスペアが eligible な2クリークの和もクリーク）。

**連鎖排除の根拠**：A群とB群を同居させるには、A・Bの全メンバー間が eligible でなければならない。インフレ群×訪印群はペア一致0（eligible でない）なので、いかなる橋渡し記事があっても同一クラスタになり得ない。

### 2. 決定性と出力契約

- タイブレークを完全固定（上記 ①linkage 最大 ②最小index対）し、結果は実行ごとに一意。
- 戻り値は `RawSourceArticle[][]`。**クラスタは各クラスタの最小元index昇順**で並べ、**各クラスタ内のメンバーは元index昇順**で出力する（現行のグループ生成順とほぼ同一）。
- 計算量は最悪 O(n³)（n＝1回あたりの生記事数、数十件）。LLM 合成前の前処理であり実害なし。

### 3. 挙動変化（いずれも意図的・「過剰マージ回避」に合致）

- 連鎖を構造的に排除（主目的）。
- **時間窓が全ペアに適用**される。従来の single-linkage は連結ごとの判定で、鎖の両端が窓を超えても結合し得たが、complete-linkage ではクラスタ内全員が相互に窓内。より保守的。
- クラスタが小さく・多くなり、**単一ソースクラスタ→自動却下が増える可能性**（許容方針）。
- `minSharedKeywords` の既定は **2 のまま**。complete-linkage のクリーク要件が強いため、2 でも本件の誤マージは解消する。env 変更なし。
- `debugClusterDetails` は内部で `clusterArticles` を呼ぶだけなので自動的に新挙動へ追従。

### 4. テスト（本物のユニットテスト）

Node v22.17 の `node --experimental-strip-types` ＋ 組み込み `node:test` / `node:assert` を使用（**依存追加なし**）。新規 `lib/clustering.test.ts` に、ネットワーク不要の合成 `RawSourceArticle[]` で以下を検証：

1. **アンチ連鎖（核心）**：A–B と B–C が閾値以上一致するが A–C は0 のとき、A・B・C が**1クラスタにならない**こと。
2. **実例再現**：本件5本相当（インフレ系2本が3語一致、訪印系2本が3語一致、橋渡し1本が各群と1語のみ）で、**インフレ源と訪印源が同一クラスタに入らない**こと。
3. **正当な重複はマージ**：2源が窓内かつ閾値以上一致 → 1クラスタに結合（リグレッション防止）。
4. **時間窓超過は非マージ**：高一致でも `windowHours` を超えていれば結合しない。
5. **決定性**：同入力で複数回実行して同一結果。

`package.json` に `"test:clustering": "node --experimental-strip-types --test lib/clustering.test.ts"` を追加。検証手段は本テスト ＋ `./node_modules/.bin/tsc --noEmit`。

## 影響ファイル

- `lib/clustering.ts` — `clusterArticles` 内部を complete-linkage に置換。`UnionFind` クラスは `clusterArticles` 以外で未使用のため削除する。
- `lib/clustering.test.ts` — 新規ユニットテスト。
- `package.json` — `test:clustering` スクリプト追加。

## 検証

- `node --experimental-strip-types --test lib/clustering.test.ts`（全テスト pass、出力クリーン）。
- `./node_modules/.bin/tsc --noEmit`（型エラーなし）。
