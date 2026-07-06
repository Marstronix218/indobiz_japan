# トップページ ポータル型リデザイン Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** IndoBiz Japan のトップページを、モックアップ準拠のポータル型ニュースレイアウト（ヒーロー＋カテゴリ別ブロック＋最新ニュース＋右サイドバー4ウィジェット）にフル移行し、記事の実閲覧数に基づくアクセスランキングを新規導入する。

**Architecture:** 既存トップページ（`components/news-list.tsx`）を in-place で再構成。閲覧計測は新テーブル `article_view_events` ＋ 記録API ＋ サーバー集計。ランキング／重要ニュースの選定ロジックは純粋関数 `lib/home-selection.ts` に切り出し、`node --experimental-strip-types` で単体検証する。既存のティッカー・カード・データ層・フィルタ機構・記事ページ・admin は流用し変更しない。

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind + shadcn/ui, Supabase (Postgres + service-role client), lucide-react。

## Global Constraints

- 検証は `./node_modules/.bin/tsc --noEmit`（PRIMARY）。ESLint は動かない。純粋関数のみ `node --experimental-strip-types <script>.mjs` で単体テスト可能。
- 色は必ずデザイントークン（`bg-primary` / `text-accent` / `bg-card` / `text-muted-foreground` 等）を使う。ハードコードした 16進カラーを新規に足さない（ダークモード追従のため）。
- カテゴリは現行6分類（`economy / regulation / social / culture / market / column`）を維持。DB値は不変。
- 公開記事のみ表示（`usePublicArticles()` 経由）。`workflowStatus !== "published"` を絶対に描画しない。
- 閲覧記録・集計・外部fetchは fail-open：失敗してもユーザー体験・描画を止めない（エラーはログのみ）。
- LINE友だち追加URL: `https://qr.paps.jp/KRwFx`（外部リンク・新規タブ・`rel="noopener noreferrer"`）。
- 日付表示は既存ヘルパー（`formatArticleDate` / `formatArticleShortDate` / `articleDisplayDate`）を使う。JSTタイムゾーン。
- ファイルは責務ごとに分割。新ウィジェットは1ファイル1コンポーネント。

## File Structure

**新規作成:**
- `supabase/migrations/0006_view_events.sql` — 閲覧イベントテーブル
- `lib/home-selection.ts` — 純粋選定関数（型のみ import）
- `scripts/test-home-selection.mjs` — 上記の単体テスト
- `app/api/articles/[id]/view/route.ts` — 閲覧記録 POST エンドポイント
- `lib/view-tracking.ts` — クライアント側 fire-and-forget 記録ヘルパー
- `components/important-news-widget.tsx` — 「本日の重要ニュース」
- `components/access-ranking-widget.tsx` — 「アクセスランキング（24時間）」
- `components/market-indicator-panel.tsx` — 「マーケット指標」表
- `components/line-cta-box.tsx` — 公式LINE CTA
- `components/category-link-block.tsx` — カテゴリ別テキストリンクブロック

**変更:**
- `lib/site-config.ts` — `LINE_ADD_FRIEND_URL` 定数を追加
- `lib/news-data.ts` — `regulation` の表示ラベルを「規制・政策」に変更
- `lib/supabase/article-repository.ts` — `recordArticleView` / `getTopViewedArticleIds` を追加
- `components/article-view.tsx` — マウント時に閲覧記録
- `components/news-list.tsx` — ポータルレイアウトに再構成、`rankedViewIds` prop を受け取る
- `app/page.tsx` — 24hランキングIDを集計して `NewsList` に渡す

---

## Task 1: 設定定数と表示ラベルの調整

**Files:**
- Modify: `lib/site-config.ts`
- Modify: `lib/news-data.ts:111`（`CATEGORY_LABELS.regulation`）と `lib/news-data.ts:217`（`CATEGORY_SECTIONS` の regulation `label`）

**Interfaces:**
- Produces: `LINE_ADD_FRIEND_URL: string`（`lib/site-config.ts` から export）

- [ ] **Step 1: LINE URL 定数を追加**

`lib/site-config.ts` の先頭付近（`FREE_ARTICLE_LIMIT` の下）に追加:

```typescript
/**
 * 公式LINEアカウントの友だち追加URL。トップページの LINE CTA ボックス
 * (`components/line-cta-box.tsx`) から外部リンクで開く。
 */
export const LINE_ADD_FRIEND_URL = "https://qr.paps.jp/KRwFx"
```

- [ ] **Step 2: regulation の表示ラベルを変更**

`lib/news-data.ts` の `CATEGORY_LABELS`（111行目付近）:

```typescript
  regulation: "規制・政策",
```

同ファイルの `CATEGORY_SECTIONS` 内 regulation セクション（217行目付近）の `label`:

```typescript
    key: "regulation",
    label: "規制・政策",
    enLabel: "Regulation",
```

`CATEGORY_DESCRIPTIONS.regulation` / `kicker` は変更しない。

- [ ] **Step 3: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 4: Commit**

```bash
git add lib/site-config.ts lib/news-data.ts
git commit -m "feat: add LINE add-friend URL constant and rename regulation label"
```

---

## Task 2: 閲覧イベントの DB マイグレーションとリポジトリ関数

**Files:**
- Create: `supabase/migrations/0006_view_events.sql`
- Modify: `lib/supabase/article-repository.ts`（末尾に関数追加、`getServiceClient` は 16行目で import 済み）

**Interfaces:**
- Produces:
  - `recordArticleView(articleId: string): Promise<void>` — 1件 insert。fail-open（throw しない）。
  - `getTopViewedArticleIds(hours?: number, limit?: number): Promise<string[]>` — 直近 `hours`（既定24）の閲覧数上位 `limit`（既定5）の article_id を降順で返す。失敗時は `[]`。

- [ ] **Step 1: マイグレーションSQLを書く**

`supabase/migrations/0006_view_events.sql`:

```sql
-- 記事の閲覧イベント（ベータ期のアクセスランキング用）。
-- 認証記事ページ (ArticleView) のマウント毎に1行 insert される。
-- 旧会員制の `article_views` とは別テーブル。混同しないこと。
-- Apply via Supabase SQL Editor or `supabase db push`.

create table if not exists public.article_view_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists article_view_events_viewed_at_idx
  on public.article_view_events (viewed_at);

create index if not exists article_view_events_article_viewed_idx
  on public.article_view_events (article_id, viewed_at);

-- RLS 有効。クライアント直アクセスは無し。読み書きは service-role のみ。
alter table public.article_view_events enable row level security;
```

- [ ] **Step 2: `recordArticleView` を追加**

`lib/supabase/article-repository.ts` の末尾に追加。既存 import の `getServiceClient` / `hasSupabaseConfig` を使う:

```typescript
/**
 * Record a single article view for the beta access-ranking widget.
 * Fail-open: never throws, so a logging failure can't break the reader page.
 */
export async function recordArticleView(articleId: string): Promise<void> {
  if (!hasSupabaseConfig()) return
  try {
    const { error } = await getServiceClient()
      .from("article_view_events")
      .insert({ article_id: articleId })
    if (error) {
      console.error("[supabase] recordArticleView failed:", error.message)
    }
  } catch (err) {
    console.error("[supabase] recordArticleView threw:", err)
  }
}
```

- [ ] **Step 3: `getTopViewedArticleIds` を追加**

同ファイルの末尾に追加:

```typescript
/**
 * Article IDs with the most views in the last `hours`, most-viewed first.
 * Used by the homepage access-ranking widget. Fails open to an empty array,
 * in which case the widget falls back to popularity-score ordering.
 */
export async function getTopViewedArticleIds(
  hours = 24,
  limit = 5,
): Promise<string[]> {
  if (!hasSupabaseConfig()) return []
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  try {
    const { data, error } = await getServiceClient()
      .from("article_view_events")
      .select("article_id")
      .gte("viewed_at", since)
    if (error) {
      console.error("[supabase] getTopViewedArticleIds failed:", error.message)
      return []
    }
    const counts = new Map<string, number>()
    for (const row of (data as { article_id: string }[] | null) ?? []) {
      counts.set(row.article_id, (counts.get(row.article_id) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)
  } catch (err) {
    console.error("[supabase] getTopViewedArticleIds threw:", err)
    return []
  }
}
```

- [ ] **Step 4: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 5: マイグレーションを Supabase に適用**

Supabase SQL Editor に `supabase/migrations/0006_view_events.sql` の内容を貼り付けて実行（またはローカルで `supabase db push`）。
Expected: `article_view_events` テーブルが作成される。

> 注: 実行環境に Supabase 認証情報が無い場合はこのステップをスキップし、コミットメッセージ／PR に「0006 マイグレーション未適用 — 手動適用が必要」と明記する。

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0006_view_events.sql lib/supabase/article-repository.ts
git commit -m "feat: add article_view_events table and view-count repository fns"
```

---

## Task 3: 閲覧記録 API と記事ページからの記録

**Files:**
- Create: `app/api/articles/[id]/view/route.ts`
- Create: `lib/view-tracking.ts`
- Modify: `components/article-view.tsx`（`ArticleView` 内に記録用 useEffect を追加）

**Interfaces:**
- Consumes: `recordArticleView(articleId)`（Task 2）
- Produces:
  - `POST /api/articles/[id]/view` → `204 No Content`（成功／fail-open）
  - `recordArticleViewClient(id: string): void`（`lib/view-tracking.ts`、fire-and-forget）

- [ ] **Step 1: 記録APIルートを書く**

`app/api/articles/[id]/view/route.ts`。Next.js 16 の動的ルートは `params` が Promise:

```typescript
import { NextResponse } from "next/server"
import { recordArticleView } from "@/lib/supabase/article-repository"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await recordArticleView(id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 2: クライアント記録ヘルパーを書く**

`lib/view-tracking.ts`:

```typescript
/**
 * Fire-and-forget: record a view for the given article. Any failure is
 * swallowed — view logging must never affect the reader experience.
 */
export function recordArticleViewClient(id: string): void {
  try {
    void fetch(`/api/articles/${id}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
```

- [ ] **Step 3: `ArticleView` のマウント時に記録**

`components/article-view.tsx` の `ArticleView` コンポーネント内（`const article = articles.find(...)` の直後、早期 return より前）に追加。まず import を先頭のクライアント import 群に足す:

```typescript
import { recordArticleViewClient } from "@/lib/view-tracking"
```

`ArticleView` 本体、`article` を解決した直後に:

```typescript
  useEffect(() => {
    if (!article) return
    recordArticleViewClient(article.id)
  }, [article?.id])
```

> `useEffect` は既に `article-view.tsx:3` で import 済み。`article` が未解決（記事なし）の場合は記録しない。ティーザー（未ログイン）は別コンポーネントなのでカウントされない。

- [ ] **Step 4: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 5: 手動で記録を確認**

Run: `npm run dev` を起動し、別ターミナルで:
```bash
curl -i -X POST http://localhost:3000/api/articles/test-id/view
```
Expected: `HTTP/1.1 204 No Content`。Supabase未接続でも 204（fail-open）。接続済みなら `article_view_events` に行が増える（存在する article id で実行した場合）。

- [ ] **Step 6: Commit**

```bash
git add app/api/articles lib/view-tracking.ts components/article-view.tsx
git commit -m "feat: record article views on reader page mount"
```

---

## Task 4: ホーム選定の純粋関数と単体テスト

**Files:**
- Create: `lib/home-selection.ts`
- Create: `scripts/test-home-selection.mjs`

**Interfaces:**
- Consumes: `type NewsArticle`（**型のみ** import。実行時ロードなし）。スコアリング関数は引数で注入する（依存性注入）。
- Produces:
  - `type ScoreOf = (article: NewsArticle, now: number) => number`
  - `selectImportantNews(articles: NewsArticle[], now: number, limit: number, scoreOf: ScoreOf): NewsArticle[]` — 直近24hの記事を `scoreOf` 降順に最大 `limit`。24h以内が `limit` 未満なら残りを24h外の記事のスコア順で補完。
  - `mergeRankedArticles(rankedIds: string[], articles: NewsArticle[], limit: number, scoreOf: ScoreOf): NewsArticle[]` — `rankedIds` 順に解決し、`limit` 未満なら未収録記事の `scoreOf` 降順で補完。存在しないIDは無視。重複なし。

> 設計判断: `home-selection.ts` は `computePopularityScore` を**import せず引数で受け取る**。理由は (1) `import type` のみにすればモジュールが型ストリップで単体ロード可能（`news-data.ts` を実行時に引っ張らない）、(2) コードベース慣習の拡張子なし import を維持でき、(3) テストでスタブscorerを差し込めて選定ロジックだけを独立検証できるため。呼び出し側（Task 5 のウィジェット）が `computePopularityScore` を渡す。`computePopularityScore(article, now)` は `ScoreOf` と同一シグネチャ。

- [ ] **Step 1: 失敗するテストを書く**

`scripts/test-home-selection.mjs`:

```javascript
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

console.log("PASS home-selection")
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run: `node --experimental-strip-types scripts/test-home-selection.mjs`
Expected: FAIL — `Cannot find module '../lib/home-selection.ts'`（未作成）

- [ ] **Step 3: 純粋関数を実装**

`lib/home-selection.ts`:

```typescript
import type { NewsArticle } from "./news-data"

const DAY_MS = 24 * 60 * 60 * 1000

/** Scores an article for ordering. Matches `computePopularityScore`'s shape. */
export type ScoreOf = (article: NewsArticle, now: number) => number

function byScoreDesc(now: number, scoreOf: ScoreOf) {
  return (a: NewsArticle, b: NewsArticle) => scoreOf(b, now) - scoreOf(a, now)
}

/**
 * Auto-select "本日の重要ニュース": articles published within the last 24h,
 * ordered by `scoreOf`, capped at `limit`. If fewer than `limit` articles
 * fall inside the window, backfill with the next-best older ones so the
 * widget is never near-empty.
 */
export function selectImportantNews(
  articles: NewsArticle[],
  now: number,
  limit: number,
  scoreOf: ScoreOf,
): NewsArticle[] {
  const sorted = [...articles].sort(byScoreDesc(now, scoreOf))
  const cutoff = now - DAY_MS
  const within: NewsArticle[] = []
  const older: NewsArticle[] = []
  for (const a of sorted) {
    const ts = Date.parse(a.createdAt ?? a.publishedAt)
    if (!Number.isNaN(ts) && ts >= cutoff) within.push(a)
    else older.push(a)
  }
  return [...within, ...older].slice(0, limit)
}

/**
 * Resolve `rankedIds` (from 24h view counts) to articles in order, then
 * backfill by `scoreOf` up to `limit`. Unknown ids are skipped and no
 * article appears twice.
 */
export function mergeRankedArticles(
  rankedIds: string[],
  articles: NewsArticle[],
  limit: number,
  scoreOf: ScoreOf,
): NewsArticle[] {
  const byId = new Map(articles.map((a) => [a.id, a]))
  const result: NewsArticle[] = []
  const used = new Set<string>()
  for (const id of rankedIds) {
    const a = byId.get(id)
    if (a && !used.has(id)) {
      result.push(a)
      used.add(id)
    }
  }
  if (result.length < limit) {
    const now = Date.now()
    const backfill = [...articles]
      .filter((a) => !used.has(a.id))
      .sort(byScoreDesc(now, scoreOf))
    for (const a of backfill) {
      if (result.length >= limit) break
      result.push(a)
      used.add(a.id)
    }
  }
  return result.slice(0, limit)
}
```

- [ ] **Step 4: テストを実行して成功を確認**

Run: `node --experimental-strip-types scripts/test-home-selection.mjs`
Expected: `PASS home-selection`（exit 0。ExperimentalWarning は無視してよい）

- [ ] **Step 5: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 6: Commit**

```bash
git add lib/home-selection.ts scripts/test-home-selection.mjs
git commit -m "feat: add pure home-page selection helpers with unit tests"
```

---

## Task 5: 本日の重要ニュース／アクセスランキング ウィジェット

**Files:**
- Create: `components/important-news-widget.tsx`
- Create: `components/access-ranking-widget.tsx`

**Interfaces:**
- Consumes: `usePublicArticles()`, `selectImportantNews` / `mergeRankedArticles`（Task 4）, `CATEGORY_LABELS`, `articleDisplayDate`, `formatArticleShortDate`
- Produces:
  - `<ImportantNewsWidget />` — props なし。store から自動選定。
  - `<AccessRankingWidget rankedIds={string[]} />`

- [ ] **Step 1: ImportantNewsWidget を書く**

`components/important-news-widget.tsx`:

```tsx
"use client"

import Link from "next/link"
import { Newspaper } from "lucide-react"
import { usePublicArticles } from "@/lib/article-store"
import { selectImportantNews } from "@/lib/home-selection"
import {
  CATEGORY_LABELS,
  articleDisplayDate,
  computePopularityScore,
  formatArticleShortDate,
} from "@/lib/news-data"

export function ImportantNewsWidget() {
  const articles = usePublicArticles()
  const items = selectImportantNews(articles, Date.now(), 5, computePopularityScore)
  if (items.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <Newspaper className="size-4 text-primary" />
        <h3 className="font-serif text-sm font-bold">本日の重要ニュース</h3>
      </div>
      <ul className="space-y-3">
        {items.map((article) => (
          <li key={article.id} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold text-accent">
              {formatArticleShortDate(articleDisplayDate(article))}
            </span>
            <div className="min-w-0">
              <span className="mb-0.5 inline-block bg-secondary px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground">
                {CATEGORY_LABELS[article.category]}
              </span>
              <Link
                href={`/article/${article.id}`}
                className="line-clamp-2 text-[13px] font-semibold leading-snug hover:text-accent"
              >
                {article.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-3 block text-center text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: AccessRankingWidget を書く**

`components/access-ranking-widget.tsx`:

```tsx
"use client"

import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { usePublicArticles } from "@/lib/article-store"
import { mergeRankedArticles } from "@/lib/home-selection"
import {
  articleDisplayDate,
  computePopularityScore,
  formatArticleShortDate,
} from "@/lib/news-data"

export function AccessRankingWidget({ rankedIds }: { rankedIds: string[] }) {
  const articles = usePublicArticles()
  const ranked = mergeRankedArticles(rankedIds, articles, 5, computePopularityScore)
  if (ranked.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-accent" />
          <h3 className="font-serif text-sm font-bold">アクセスランキング</h3>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
          24時間
        </span>
      </div>
      <ul className="space-y-3.5">
        {ranked.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <span
              className={
                "w-7 shrink-0 font-serif text-2xl font-black leading-none " +
                (index < 3 ? "text-accent" : "text-border")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/article/${article.id}`}
                className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
              >
                {article.title}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {formatArticleShortDate(articleDisplayDate(article))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 4: Commit**

```bash
git add components/important-news-widget.tsx components/access-ranking-widget.tsx
git commit -m "feat: add important-news and access-ranking sidebar widgets"
```

---

## Task 6: マーケット指標パネルと LINE CTA ボックス

**Files:**
- Create: `components/market-indicator-panel.tsx`
- Create: `components/line-cta-box.tsx`

**Interfaces:**
- Consumes: `/api/market/snapshot`（既存）, `type MarketSnapshotLive`（`lib/market-data.ts`）, `LINE_ADD_FRIEND_URL`（Task 1）
- Produces: `<MarketIndicatorPanel />`（props なし）, `<LineCtaBox />`（props なし）

- [ ] **Step 1: MarketIndicatorPanel を書く**

既存 `MarketIndicatorWidget`（`components/sidebar-widgets.tsx`）のライブfetchロジックを流用しつつ、モック風の表レイアウトにする。`components/market-indicator-panel.tsx`:

```tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LineChart } from "lucide-react"
import type { MarketSnapshotLive } from "@/lib/market-data"

type Row = { label: string; value: string; change: string; up: boolean }

const WANTED = ["Sensex", "Nifty 50", "USD/INR", "INR/JPY", "Gold", "Brent"]

function rowsFromLive(snapshot: MarketSnapshotLive): Row[] {
  const map = new Map(snapshot.items.map((q) => [q.label, q]))
  return WANTED.map((w) => map.get(w))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      label: q.label,
      value: q.value,
      change: q.change,
      up: q.direction === "up",
    }))
}

function formatAsOf(ts: number): string {
  return new Date(ts * 1000).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  })
}

export function MarketIndicatorPanel() {
  const [snapshot, setSnapshot] = useState<MarketSnapshotLive | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/market/snapshot", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as MarketSnapshotLive
        if (!cancelled) setSnapshot(data)
      } catch {
        // keep last snapshot / placeholder
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const rows: Row[] = snapshot
    ? rowsFromLive(snapshot)
    : WANTED.map((label) => ({ label, value: "—", change: "—", up: false }))
  const asOf = snapshot ? `${formatAsOf(snapshot.asOf)} IST 時点` : "ロード中…"

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <LineChart className="size-4 text-primary" />
        <h3 className="font-serif text-sm font-bold">マーケット指標</h3>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 last:border-0">
              <td className="py-1.5 text-muted-foreground">{row.label}</td>
              <td className="py-1.5 text-right font-mono font-semibold tabular-nums">
                {row.value}
              </td>
              <td
                className={
                  "py-1.5 pl-2 text-right font-mono text-xs " +
                  (row.up ? "text-emerald-700" : "text-accent")
                }
              >
                {row.change !== "—" ? (row.up ? "▲" : "▼") : ""} {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-right font-mono text-[10px] text-muted-foreground">
        {asOf}
      </p>
      <Link
        href="/?category=market"
        className="mt-2 block text-center text-[11px] font-semibold text-primary hover:underline"
      >
        市況一覧を見る
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: LineCtaBox を書く**

`components/line-cta-box.tsx`:

```tsx
import Link from "next/link"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export function LineCtaBox() {
  return (
    <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-5 text-center">
      <p className="font-serif text-sm font-bold text-primary">
        Go India 公式LINE 会員特典
      </p>
      <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
        IndoBiz Japan の記事を無料で読めます。最新ニュースをLINEでお届け。
      </p>
      <a
        href={LINE_ADD_FRIEND_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
      >
        LINEで友だち追加する
      </a>
      <p className="mt-2 text-[11px] text-muted-foreground">
        すでに友だちの方は
        <Link href="/login" className="font-semibold text-primary hover:underline">
          ログイン
        </Link>
        してください
      </p>
    </div>
  )
}
```

- [ ] **Step 3: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 4: Commit**

```bash
git add components/market-indicator-panel.tsx components/line-cta-box.tsx
git commit -m "feat: add market-indicator panel and LINE CTA box widgets"
```

---

## Task 7: カテゴリ別テキストリンクブロック

**Files:**
- Create: `components/category-link-block.tsx`

**Interfaces:**
- Consumes: `type CategorySection`, `type NewsArticle`, `articleDisplayDate`, `formatArticleShortDate`
- Produces: `<CategoryLinkBlock section={CategorySection} articles={NewsArticle[]} />` — 見出し＋日付付きテキストリンク最大4件＋「もっと見る」

- [ ] **Step 1: CategoryLinkBlock を書く**

`components/category-link-block.tsx`:

```tsx
import Link from "next/link"
import {
  articleDisplayDate,
  formatArticleShortDate,
  type CategorySection,
  type NewsArticle,
} from "@/lib/news-data"

export function CategoryLinkBlock({
  section,
  articles,
}: {
  section: CategorySection
  articles: NewsArticle[]
}) {
  if (articles.length === 0) return null
  const items = articles.slice(0, 4)

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2 border-b-2 border-primary pb-1.5">
        <span
          className="size-2.5 shrink-0 rounded-sm"
          style={{ background: section.accent }}
        />
        <h3 className="font-serif text-base font-bold">{section.label}</h3>
      </div>
      <ul className="divide-y divide-border">
        {items.map((article) => (
          <li key={article.id} className="py-2">
            <Link
              href={`/article/${article.id}`}
              className="group flex gap-2"
            >
              <span className="shrink-0 font-mono text-[10px] font-semibold text-accent">
                {formatArticleShortDate(articleDisplayDate(article))}
              </span>
              <span className="line-clamp-2 text-[13px] leading-snug group-hover:text-accent">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/?category=${section.key}`}
        className="mt-2 inline-block text-[11px] font-semibold text-primary hover:underline"
      >
        もっと見る →
      </Link>
    </section>
  )
}
```

- [ ] **Step 2: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）

- [ ] **Step 3: Commit**

```bash
git add components/category-link-block.tsx
git commit -m "feat: add category link block component"
```

---

## Task 8: ポータルレイアウトの組み立てとページ配線

**Files:**
- Modify: `components/news-list.tsx`（ポータルレイアウトに再構成、`rankedViewIds` prop 追加）
- Modify: `app/page.tsx`（24hランキングIDを集計して渡す）

**Interfaces:**
- Consumes: `getTopViewedArticleIds`（Task 2）, `ImportantNewsWidget` / `AccessRankingWidget` / `MarketIndicatorPanel` / `LineCtaBox`（Task 5,6）, `CategoryLinkBlock`（Task 7）, 既存 `NewsCardHero` / `NewsCardMosaic` / `NewsCardTile`, `CATEGORY_SECTIONS`, `CATEGORY_LABELS`
- Produces: `<NewsList rankedViewIds={string[]} />`

- [ ] **Step 1: `app/page.tsx` でランキングIDを集計して渡す**

`app/page.tsx` を更新:

```tsx
import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getTopViewedArticleIds,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

export const revalidate = 0

export default async function HomePage() {
  if (!hasSupabaseConfig()) {
    return <DataUnavailable />
  }

  const [articles, rankedViewIds] = await Promise.all([
    listPublishedArticles(),
    getTopViewedArticleIds(24, 5),
  ])
  if (articles.length === 0) {
    return <DataUnavailable />
  }

  return (
    <ArticleStoreProvider initial={articles}>
      <NewsList rankedViewIds={rankedViewIds} />
    </ArticleStoreProvider>
  )
}
```

- [ ] **Step 2: `news-list.tsx` の import を更新**

`components/news-list.tsx` の import 群を差し替え。`TopicCarousel` / `TopicHeader` と旧サイドバーウィジェット群を外し、新コンポーネントを足す:

```tsx
"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { NewsCardHero, NewsCardMosaic, NewsCardTile } from "@/components/news-card"
import { CategoryLinkBlock } from "@/components/category-link-block"
import { MarketTicker } from "@/components/market-ticker"
import { ImportantNewsWidget } from "@/components/important-news-widget"
import { AccessRankingWidget } from "@/components/access-ranking-widget"
import { MarketIndicatorPanel } from "@/components/market-indicator-panel"
import { LineCtaBox } from "@/components/line-cta-box"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SiteIntro } from "@/components/site-intro"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_OPTIONS,
  CATEGORY_SECTIONS,
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  articleDisplayDate,
  computePopularityScore,
  type Category,
  type IndustryTag,
  type NewsArticle,
} from "@/lib/news-data"
```

> `TopicCarousel` / `TopicHeader` は現状 `FilteredResults` が使うが、Step 4 で `FilteredResults` を `NewsCardTile` グリッドに書き換えるため両方とも不要になる。よって上記 import から外す。`news-list.tsx` 自身は日付ヘルパーを直接使わない（`CategoryLinkBlock`・各ウィジェット側で使う）ので `articleDisplayDate` のみ `latest` ソート用に残し、`formatArticleShortDate` は import しない。

- [ ] **Step 3: `NewsList` シグネチャとポータル本体を差し替え**

`export function NewsList() {` を `export function NewsList({ rankedViewIds }: { rankedViewIds: string[] }) {` に変更。`hero/mosaic` 分割は4枚取りに変更。`return (...)` 内の非フィルタ時レイアウトを差し替える。

`const [hero, mosaic1, mosaic2, mosaic3, ...rest] = sortedArticles` を:

```tsx
  const [hero, m1, m2, m3, m4, ...rest] = sortedArticles
```

`sectionsByCategory` の元を `rest` から全記事ベースに変更（カテゴリブロックは hero/mosaic と重複してよい＝ポータルの通例。ただし最新ニュースは別枠）。`sectionsByCategory` の定義を:

```tsx
  const sectionsByCategory = useMemo(() => {
    const buckets = new Map<Category, NewsArticle[]>()
    for (const section of CATEGORY_SECTIONS) buckets.set(section.key, [])
    for (const article of sortedArticles) {
      buckets.get(article.category)?.push(article)
    }
    return buckets
  }, [sortedArticles])

  const latest = useMemo(
    () =>
      [...sortedArticles]
        .sort(
          (a, b) =>
            Date.parse(articleDisplayDate(b)) - Date.parse(articleDisplayDate(a)),
        )
        .slice(0, 6),
    [sortedArticles],
  )
```

`return` の非フィルタ分岐（`hasResults ?` 内、`hero &&` セクション以降）を次のポータル構造に置き換える。フィルタ時（`filterActive`）は従来どおり `FilteredResults` を表示:

```tsx
        {hasResults ? (
          filterActive ? (
            <FilteredResults articles={sortedArticles} />
          ) : (
            <>
              {/* Hero: 1 large + 4 medium */}
              {hero && (
                <section className="mb-10 grid gap-3 lg:grid-cols-2">
                  <div className="lg:min-h-[26rem]">
                    <NewsCardHero article={hero} className="h-full lg:aspect-auto" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:min-h-[26rem]">
                    {[m1, m2, m3, m4].map(
                      (a, i) =>
                        a && (
                          <NewsCardMosaic
                            key={a.id}
                            article={a}
                            className="aspect-[16/10] lg:aspect-auto"
                            priority={i < 2}
                          />
                        ),
                    )}
                  </div>
                </section>
              )}

              <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-10">
                  {/* Category blocks: 3-col x 2-row */}
                  <section>
                    <SectionHeading title="カテゴリ別ニュース" en="BY CATEGORY" />
                    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                      {CATEGORY_SECTIONS.map((section) => (
                        <CategoryLinkBlock
                          key={section.key}
                          section={section}
                          articles={sectionsByCategory.get(section.key) ?? []}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Latest news: thumbnail 2-col grid */}
                  <section>
                    <SectionHeading title="最新ニュース" en="LATEST" />
                    <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                      {latest.map((article) => (
                        <NewsCardTile key={article.id} article={article} />
                      ))}
                    </div>
                    <Link
                      href="/?q="
                      className="mt-6 block rounded-md border border-border bg-card py-3 text-center text-sm font-semibold text-primary transition-colors hover:border-primary"
                    >
                      最新ニュースをもっと見る
                    </Link>
                  </section>
                </div>

                <aside className="space-y-5 self-start lg:sticky lg:top-4">
                  <ImportantNewsWidget />
                  <AccessRankingWidget rankedIds={rankedViewIds} />
                  <MarketIndicatorPanel />
                  <LineCtaBox />
                </aside>
              </div>
            </>
          )
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-base leading-8 text-muted-foreground">
            条件に合う記事が見つかりませんでした。
          </div>
        )}
```

> 「最新ニュースをもっと見る」は現状すべての公開記事を1ページに読み込んでいるため、専用の全件ページは無い。暫定で `/?q=`（＝フィルタ有効化で全記事の縦グリッド表示）に飛ばす。将来 `/news` 一覧を作る場合はここを差し替える。

- [ ] **Step 4: `FilteredResults` を `NewsCardTile` グリッドに置き換え、`SectionHeading` を追加**

`FilteredResults` は現状 `TopicCarousel` を使う。カルーセルを廃止するので `NewsCardTile` グリッドに変更:

```tsx
function FilteredResults({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null
  return (
    <div className="lg:col-span-full">
      <div className="mb-4 flex items-end justify-between">
        <SectionHeading title="検索結果" en="RESULTS" />
        <span className="font-mono text-xs text-muted-foreground">
          {articles.length}記事
        </span>
      </div>
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <NewsCardTile key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

function SectionHeading({ title, en }: { title: string; en: string }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="size-2.5 rounded-sm bg-accent" />
        <h2 className="font-serif text-2xl font-bold tracking-tight">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          // {en}
        </span>
      </div>
      <div className="topic-rule" />
    </div>
  )
}
```

> フィルタ時は `FilterSummary` / `IndustryFilterPanel` の既存分岐と `FilteredResults` をそのまま使う。フィルタ時の外枠は従来の単一カラム（`main` 直下）で良いので、`filterActive` 分岐では上記の grid（サイドバー付き）に入らず `FilteredResults` を直接返す構造にする（Step 3 の三項で担保済み）。`IndustryFilterPanel` / `FilterSummary` / `IndustryChip` は変更しない。

- [ ] **Step 5: 未使用 import / コンポーネントを掃除**

`TopicCarousel` と `TopicHeader` は `news-list.tsx` からもう使わない。import から削除済みであることを確認。`computePopularityScore` は `sortedArticles` のソートで引き続き使用。`sectionsByCategory` の `useMemo` 依存配列は元コードの `[rest]` から `[sortedArticles]`（Step 3 で変更済み）に一致していることを確認。旧 `showIndustryFilter` を依存に含めない。`import type { NewsArticle }` は `FilteredResults` / `SectionHeading` の引数型で使用継続。

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（exit 0）。未使用変数の TS エラーが出たら該当 import を削除して再実行。

- [ ] **Step 6: 開発サーバーで目視確認**

Run: `npm run dev` → http://localhost:3000

確認項目:
- デスクトップ幅: ヒーロー（大1＋中4）→ カテゴリ別ニュース（3列×2段）→ 最新ニュース（2列サムネイル）が左カラム、右サイドバーに「本日の重要ニュース／アクセスランキング／マーケット指標／Go India 公式LINE」の順で表示される。
- サイドバーが `lg:sticky` でスクロール追従する。
- モバイル幅（375px相当）: 1カラムで縦積みになり、横スクロールが発生しない。
- カテゴリナビ or カテゴリブロックの「もっと見る」クリック → `?category=` で検索結果グリッド（`FilteredResults`、4列）に切り替わる。
- 検索ボックスに文字入力 → 検索結果グリッドに切り替わる。「フィルタを解除」で戻る。
- LINE CTA の「LINEで友だち追加する」→ 新規タブで `https://qr.paps.jp/KRwFx` が開く。
- ダークモード（OS設定 or トグル）で色が破綻しない。
- 記事を1本開く → トップに戻ると数分内でアクセスランキングに反映（Supabase接続時。未接続時は人気スコア順のフォールバックが表示される）。

- [ ] **Step 7: Commit**

```bash
git add components/news-list.tsx app/page.tsx
git commit -m "feat: rebuild homepage as portal layout with ranking sidebar"
```

---

## Self-Review 結果

**Spec coverage:**
- フル移行（ヒーロー/カテゴリ/最新/サイドバー）→ Task 5,6,7,8 ✅
- 本物の閲覧計測導入 → Task 2,3 ✅
- 本日の重要ニュース自動選定 → Task 4,5（`selectImportantNews`）✅
- アクセスランキング（実閲覧＋フォールバック）→ Task 2,4,5,8 ✅
- LINE CTA（`https://qr.paps.jp/KRwFx`）→ Task 1,6 ✅
- 現行6分類維持・regulation 表示ラベルのみ変更 → Task 1 ✅
- 既存フィルタ／検索／ダークモード維持 → Task 8 ✅
- fail-open エラーハンドリング → Task 2,3,6 ✅
- モバイル1カラム順序 → Task 8 Step 6 で検証 ✅

**Placeholder scan:** プレースホルダなし。全ステップに実コード／実コマンドを記載。

**Type consistency:** `getTopViewedArticleIds`（Task2）→ `rankedViewIds`（Task8 page）→ `rankedIds`（Task5 widget prop, Task4 `mergeRankedArticles`）の受け渡しが一貫。`selectImportantNews` / `mergeRankedArticles` のシグネチャは Task4 定義と Task5 使用で一致。`recordArticleView`（Task2）→ APIルート（Task3）→ `recordArticleViewClient`（Task3）→ `ArticleView`（Task3）が一貫。

**スコープ外（実装しない）:** カテゴリ体系の変更、記事ページ/admin/パイプライン変更、bot除外・重複排除付き解析。
