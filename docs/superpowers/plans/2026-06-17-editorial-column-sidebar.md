# 編集部コラム（手動投稿 → サイドバー＋フィード掲載）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 編集部が「コラム」カテゴリで手動投稿した記事を、トップのサイドバー新ウィジェットとフィードのコラムセクション両方に掲載し、人手コラム本文の自動フィラー水増しを止める。

**Architecture:** `category === "column"` を編集部コラムの識別子として再利用（スキーマ変更なし）。フィード掲載は既存の `CATEGORY_SECTIONS` 振り分けで自動的に成立するため、新規実装はサイドバーウィジェット・本文レンダリング分岐・管理フォームの `contentType` 導出の3点に限定。

**Tech Stack:** Next.js 16 / React 19 / TypeScript / Tailwind / shadcn-ui。状態は `lib/article-store.ts` の `useSyncExternalStore` シングルトン。

## Global Constraints

- 検証手段は `./node_modules/.bin/tsc --noEmit`（型チェック）＋ ローカル手動確認。**自動テストスイートは存在せず、ESLint は未インストール**（`npm run lint` は失敗する）。本リポジトリにテストフレームワークを新規導入しない（YAGNI / スコープ外）。各タスクのテストサイクルは「型チェック → 手動確認 → コミット」。
- DB スキーマ / マイグレーションは変更しない。
- AI 合成パイプライン（`lib/automation.ts`、`/api/cron/scrape`）は変更しない。
- ニュース記事（`contentType === "news"` かつ非コラム）の本文レンダリング・サイドバー Trending の挙動は不変に保つ（リグレッション禁止）。
- 編集部判定式は全箇所で統一: `article.contentType !== "news" || article.category === "column"`。
- コミットメッセージ末尾に必ず付与:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```

---

### Task 1: サイドバー新ウィジェット `EditorialColumnWidget`

**Files:**
- Modify: `components/sidebar-widgets.tsx`（末尾に新コンポーネントを追加）
- Modify: `components/news-list.tsx`（import 行と `<aside>` 内）

**Interfaces:**
- Consumes: `usePublicArticles()`（`@/lib/article-store`、既に同ファイルで import 済み）, `articleDisplayDate` / `formatArticleShortDate`（`@/lib/news-data`、import 済み）, `resolveArticleImageUrl`（`@/lib/image-utils`、import 済み）, `RailHead`（同ファイル内ローカル関数）。
- Produces: `export function EditorialColumnWidget(): JSX.Element | null`（props なし、自己完結）。`news-list.tsx` がこれを `<aside>` 最上部にレンダリングする。

- [ ] **Step 1: `EditorialColumnWidget` を追加**

`components/sidebar-widgets.tsx` の末尾（`CollabHighlightWidget` の閉じ `}` の後、ファイル最終行）に以下を追記する。必要な import（`Link`, `Image`, `usePublicArticles`, `articleDisplayDate`, `formatArticleShortDate`, `resolveArticleImageUrl`）はすべて同ファイル冒頭に既存のため追加不要。

```tsx
export function EditorialColumnWidget() {
  const articles = usePublicArticles()
  const columns = [...articles]
    .filter((article) => article.category === "column")
    .sort(
      (left, right) =>
        new Date(articleDisplayDate(right)).getTime() -
        new Date(articleDisplayDate(left)).getTime(),
    )
    .slice(0, 3)

  if (columns.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="編集部コラム" en="EDITORIAL" icon="📝" />
      <ul className="space-y-4">
        {columns.map((article) => {
          const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
          return (
            <li key={article.id}>
              <Link href={`/article/${article.id}`} className="group flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 ph-stripe" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug group-hover:text-accent">
                    {article.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {article.summary}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatArticleShortDate(articleDisplayDate(article))}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: `news-list.tsx` の import に追加**

`components/news-list.tsx` の現在の import（10-14 行目）:

```tsx
import {
  TrendingWidget,
  MarketIndicatorWidget,
  CitySpotlightWidget,
} from "@/components/sidebar-widgets"
```

を次に置き換える:

```tsx
import {
  EditorialColumnWidget,
  TrendingWidget,
  MarketIndicatorWidget,
  CitySpotlightWidget,
} from "@/components/sidebar-widgets"
```

- [ ] **Step 3: `<aside>` 最上部にウィジェットを配置**

`components/news-list.tsx` の現在の `<aside>`（235-239 行目）:

```tsx
              <aside className="space-y-5 self-start lg:col-span-1 lg:sticky lg:top-4">
                <TrendingWidget />
                <MarketIndicatorWidget />
                <CitySpotlightWidget />
              </aside>
```

を次に置き換える:

```tsx
              <aside className="space-y-5 self-start lg:col-span-1 lg:sticky lg:top-4">
                <EditorialColumnWidget />
                <TrendingWidget />
                <MarketIndicatorWidget />
                <CitySpotlightWidget />
              </aside>
```

- [ ] **Step 4: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなしで終了（終了コード 0）。

- [ ] **Step 5: 手動確認**

Run: `npm run dev`
ブラウザで `http://localhost:3000` を開く。インメモリのシード（`lib/news-data.ts` に `category: "column"` の記事が存在）または Supabase のコラム記事がある状態で、サイドバー最上部に「編集部コラム / EDITORIAL」枠が表示され、サムネイル＋タイトル＋抜粋＋日付のカードが最大3件並ぶこと。コラム記事が0件の環境では枠ごと非表示になること。Trending 枠が従来どおりコラムを含まないことも確認。

- [ ] **Step 6: コミット**

```bash
git add components/sidebar-widgets.tsx components/news-list.tsx
git commit -m "$(cat <<'EOF'
feat: add editorial column sidebar widget

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 編集部コンテンツの本文フィラー除外

**Files:**
- Modify: `components/article-view.tsx`（50 行目付近）

**Interfaces:**
- Consumes: `ensureMinimumSummaryLength` / `formatSummaryParagraphs`（`@/lib/summary-utils`、import 済み）, `article.contentType` / `article.category` / `article.summary`（`NewsArticle`）。
- Produces: 変数 `summaryParagraphs`（`string[]`）の生成挙動。後続のレンダリング（`summaryParagraphs.map(...)`、151 行目付近）はそのまま使う。

注意: `ensureMinimumSummaryLength` は内部で `cleanText`（`/\s+/g → " "`）を呼ぶため `\n\n` の段落区切りを破壊する。編集部本文では `article.summary.trim()` を**そのまま** `formatSummaryParagraphs` に渡し、段落区切り（`\n{2,}` 分割）と `whitespace-pre-line` による改行保持を活かす。

- [ ] **Step 1: フィラー分岐を追加**

`components/article-view.tsx` の現在の 50 行目:

```tsx
  const detailedSummary = ensureMinimumSummaryLength(article.summary, 500)
```

を次に置き換える:

```tsx
  const isEditorial =
    article.contentType !== "news" || article.category === "column"
  const detailedSummary = isEditorial
    ? article.summary.trim()
    : ensureMinimumSummaryLength(article.summary, 500)
```

（直後の `const summaryParagraphs = formatSummaryParagraphs(detailedSummary)` は変更不要。）

- [ ] **Step 2: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなしで終了（終了コード 0）。

- [ ] **Step 3: 手動確認**

`npm run dev` で、500 字未満の本文を持つコラム記事の記事ページ（`/article/<id>`）を開き、`summary-utils.ts` の汎用フィラー文（「背景として、政策運用や…」等）が**付かない**こと。空行区切りの本文が複数段落として表示されること。比較として通常ニュース記事では従来どおり 500 字までフィラーが入ること（挙動不変）。

- [ ] **Step 4: コミット**

```bash
git add components/article-view.tsx
git commit -m "$(cat <<'EOF'
feat: skip summary filler padding for editorial content

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 管理フォームの `contentType` 導出とコラム補助テキスト

**Files:**
- Modify: `components/admin/article-form-dialog.tsx`（送信ペイロード 272 行目付近、本文欄 351-352 行目付近）

**Interfaces:**
- Consumes: `form.category`（`Category`）, `form.summary`。
- Produces: `POST/PATCH /api/admin/articles` への送信ペイロードの `contentType` フィールド値（`"column" | "news"`）。POST ルート（`app/api/admin/articles/route.ts`）は既に `contentType` を受理・正規化するためルート側変更は不要。

- [ ] **Step 1: `contentType` をカテゴリから導出**

`components/admin/article-form-dialog.tsx` の `payload` 内、現在の 272 行目:

```tsx
      contentType: "news",
```

を次に置き換える:

```tsx
      contentType: form.category === "column" ? "column" : "news",
```

- [ ] **Step 2: コラム選択時の補助テキストを追加**

同ファイルの本文欄（`summary`）の `Textarea` 直後・閉じ `</div>` 直前。現在の 340-352 行目:

```tsx
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              placeholder="記事の本文を入力"
              className="min-h-44"
            />
          </div>
```

を次に置き換える（`Textarea` の後に条件付き `<p>` を追加）:

```tsx
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              placeholder="記事の本文を入力"
              className="min-h-44"
            />
            {form.category === "column" && (
              <p className="text-xs text-muted-foreground">
                段落は空行で区切れます。文字数の自動補完は行われません。
              </p>
            )}
          </div>
```

- [ ] **Step 3: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなしで終了（終了コード 0）。

- [ ] **Step 4: 手動確認**

`npm run dev` → `/admin` にログイン → 「記事を追加」。カテゴリ「コラム」を選ぶと本文欄下に補助テキスト「段落は空行で区切れます。…」が表示されること。コラムで保存→公開し、サイドバー「編集部コラム」枠とフィードのコラムセクション両方に出ること（Task 1 と連動）。他カテゴリ選択時は補助テキストが出ないこと。

- [ ] **Step 5: コミット**

```bash
git add components/admin/article-form-dialog.tsx
git commit -m "$(cat <<'EOF'
feat: derive contentType for editorial columns in admin form

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**1. Spec coverage:**
- セクション1（識別の仕組み・フィード自動掲載）→ 既存挙動（変更不要）。Task 1/3 がコラム記事をその経路に乗せる。✓
- セクション2（サイドバーウィジェット）→ Task 1。✓
- セクション3（管理フォーム `contentType` 導出・補助テキスト）→ Task 3。✓
- セクション4（本文フィラー除外）→ Task 2。✓
- 影響ファイル一覧の4ファイルすべてにタスクが対応。✓

**2. Placeholder scan:** TBD/TODO/「適切に処理」等なし。各コード手順に完全なコードを記載。✓

**3. Type consistency:**
- 編集部判定式 `article.contentType !== "news" || article.category === "column"` は spec/Task 2 で統一。Task 1 のウィジェットは `category === "column"` 抽出（サイドバーは編集部コラムのみ対象なので一致）。✓
- `EditorialColumnWidget`（props なし）を Task 1 で定義し同タスク内で配置。✓
- `contentType` 値は `ContentType`（`"news" | "column" | "interview"`）の範囲内（`"column" | "news"`）。✓
