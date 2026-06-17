# 編集部コラム（手動投稿 → サイドバー＋フィード掲載）設計書

- 日付: 2026-06-17
- ステータス: 承認済み（実装計画待ち）

## 背景・目的

IndoBiz Japan 編集部が、AI 合成ニュースとは別に、**人手で書いたコラム記事**を管理画面から投稿し、トップページの**サイドバー枠**と通常の**ニュースフィード（コラムセクション）の両方**に掲載できるようにする。

管理画面からの記事投稿基盤（`ArticleFormDialog` → `POST /api/admin/articles`）は既に存在する。本設計の新規実装は最小限で、以下の 3 点に限定する。

1. サイドバーの新ウィジェット `EditorialColumnWidget`
2. 管理フォームの微調整（`contentType` をカテゴリから導出）
3. 本文レンダリングのフィラー除外（人手コラムでの水増し防止）

## 決定事項（前提）

- **識別方法**: カテゴリ＝「コラム」（`category === "column"`）を編集部コラムとみなす。新フラグ・マイグレーションは不要。
- **表示範囲**: サイドバー枠とフィードのコラムセクションの両方に出す。
- **サイドバー表示形式**: サムネイル＋タイトル＋抜粋（1〜2行）＋日付のカード形式。最新 3 件。

## スコープ外（変更しないもの）

- DB スキーマ / マイグレーション（変更なし）。
- AI 合成パイプライン（`lib/automation.ts`、`/api/cron/scrape`）。`column` を生成しないため、コラム = 人手書きが実質成立する。
- フィード側の記事振り分けロジック（`news-list.tsx` / `CATEGORY_SECTIONS`）。コラムカテゴリは既にコラムセクションへ振り分けられるため、公開すれば自動で並ぶ。**コード変更ゼロ。**
- `TrendingWidget`（既に `category !== "column"` で除外済み。アクセスランキングとは干渉しない）。
- ニュース記事（`contentType === "news"`）の本文レンダリング挙動。
- 管理フォームの既存フィールド（必須項目、画像生成/アップロード、業界タグ、示唆、公開状態、出典既定「編集部」）。

## アーキテクチャ

### 1. 識別の仕組みとデータフロー

- 管理者がカテゴリ「コラム」で記事を保存 → `articles.category = "column"`、`contentType = "column"` で永続化。
- 公開後、`usePublicArticles()`（`workflowStatus === "published"` のみ）が返す配列から、
  - フィード: `news-list.tsx` が `CATEGORY_SECTIONS` のコラム枠へ自動振り分け（既存挙動、変更不要）。
  - サイドバー: 新ウィジェットが `category === "column"` を抽出して表示。
- スキーマ変更なし。`column` カテゴリと `column` / `interview` の `ContentType` は既存。

### 2. サイドバー新ウィジェット `EditorialColumnWidget`

- 追加場所: `components/sidebar-widgets.tsx`（既存 `CollabHighlightWidget` を土台にする）。
- データ取得: 自前で `usePublicArticles()` を呼び、`category === "column"` を抽出（他ウィジェットと同じ自己完結パターン）。表示日付順（`articleDisplayDate` 降順）で最新 3 件。
- 表示要素:
  - ヘッダー: 既存 `RailHead` を流用。`label="編集部コラム"`, `en="EDITORIAL"`, `icon="📝"`。
  - 各行: サムネイル（`resolveArticleImageUrl(article.imageUrl, article.id)`、無い場合は既存の `ph-stripe-*` プレースホルダ）＋ タイトル（`line-clamp` 2〜3 行）＋ **抜粋（`article.summary` 先頭の `line-clamp-2`）** ＋ 日付（`formatArticleShortDate(articleDisplayDate(article))`）。
  - 各行は `/article/${article.id}` へリンク。
- 該当 0 件のとき `return null`（枠ごと非表示）。
- 配置: `components/news-list.tsx` の `<aside>`（現状 `TrendingWidget` / `MarketIndicatorWidget` / `CitySpotlightWidget`）の **最上部**（`TrendingWidget` の上）に追加。

> 代替案として既存 `CollabHighlightWidget`（`articles` を props 受け取り、抜粋なし）の流用も検討したが、自己完結でなく抜粋表示も持たないため、自己完結＋抜粋付きの専用ウィジェットを新設する方が他ウィジェットと一貫する。

### 3. 管理フォームの調整

対象: `components/admin/article-form-dialog.tsx`

- 送信ペイロードの `contentType` をカテゴリから導出する。
  - `category === "column"` → `"column"`
  - それ以外 → `"news"`（現状の固定値と同じ）
- カテゴリで「コラム」を選択している場合のみ、本文欄（`summary`）の補助テキストを編集部向けに切り替える（例:「段落は空行で区切れます。文字数の自動補完は行われません」）。
- 新規フィールドは追加しない。その他（必須バリデーション、画像生成/アップロード、業界タグ、示唆、公開状態、出典既定「編集部」）は現状のまま。

補足: POST ルート `app/api/admin/articles/route.ts` は既に `contentType` を受理・正規化するため、ルート側の変更は不要。

### 4. 本文レンダリングのフィラー除外

対象: `components/article-view.tsx`（`lib/summary-utils.ts` はそのまま利用）

- 現状: `ArticleView` は `ensureMinimumSummaryLength(article.summary, 500)` を通し、500 字未満の本文を汎用フィラー文で水増しする。人手コラムには不適切。
- 変更: 編集部コンテンツ（判定式: `article.contentType !== "news" || article.category === "column"`）の場合はパディングをスキップし、`article.summary` をそのまま `formatSummaryParagraphs` に渡す。
  - 段落は空行（`\n\n`）区切り、`whitespace-pre-line` で改行保持（既存挙動）。
- ニュース記事（`contentType === "news"` かつ非コラム）の挙動は完全に不変（条件分岐の追加のみ）。

## エッジケース

- **画像なしコラム**: サイドバー・フィードともプレースホルダ縞模様で表示崩れなし。
- **コラム 0 件**: サイドバーウィジェットは枠ごと非表示。フィードのコラムセクションも既存ロジックで 0 件なら非表示。
- **短い本文**: フィラー除外により、編集部が短いコラムを書いても汎用文が継ぎ足されない。
- **下書き（`workflowStatus !== "published"`）**: `usePublicArticles()` が除外するため、サイドバー・フィードどちらにも出ない（既存挙動）。
- **コラムがヒーロー/モザイクに昇格**: `news-list.tsx` の人気度ソートでコラムがトップのヒーローに来る可能性はあるが、フィード掲載は許容範囲のため変更しない。

## 検証

- `./node_modules/.bin/tsc --noEmit` で型チェック（本リポジトリの主要検証手段。ESLint は未インストール、テストスイートなし）。
- 手動確認:
  1. 管理画面でカテゴリ「コラム」記事を作成・公開 → トップのサイドバー「編集部コラム」枠とフィードのコラムセクション両方に出ること。
  2. 短い本文（500 字未満）のコラムで、記事ページにフィラー文が付かないこと。
  3. ニュース記事の本文表示・サイドバー Trending が従来どおりであること（リグレッション確認）。

## 影響ファイル一覧

- `components/sidebar-widgets.tsx` — `EditorialColumnWidget` 新規追加
- `components/news-list.tsx` — `<aside>` にウィジェット配置
- `components/admin/article-form-dialog.tsx` — `contentType` 導出、コラム時の補助テキスト
- `components/article-view.tsx` — 編集部コンテンツ時のフィラー除外
