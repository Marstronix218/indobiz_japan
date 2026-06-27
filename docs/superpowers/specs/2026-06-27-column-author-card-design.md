# コラム執筆者紹介枠 — 設計

## 目的

コラム記事に「誰が書いたか」が分かる執筆者紹介枠を追加する。読者が筆者の専門性・立場を把握できるよう、名前・肩書・顔写真・短い自己紹介文を本文末尾に表示する。
**Admin の記事追加/編集フォームでカテゴリ＝コラムを選ぶと、その場で執筆者プロフィールを入力でき、Supabase に保存される。**

## スコープ

- 対象は editorial 記事のみ（`contentType !== "news" || category === "column"`）。ニュース記事には表示しない。
- 著者データは **Admin フォームでの記事個別入力を主**とし、**ロスター（共通定義）はフォームのプリフィル便宜**として併用する二段構え。
- 永続化: `articles` テーブルに著者カラムを追加するマイグレーション `0006_column_author.sql` を新設。リポジトリ→API→Admin フォームまで保存経路を通す。
- ビルド検証は `./node_modules/.bin/tsc --noEmit`。`resolveArticleAuthor()` の解決ロジックは node 組み込みテストランナーでユニットテストを追加。

## データモデル

### 著者ロスター — 新規 `lib/authors.ts`

```ts
export interface AuthorProfile {
  id: string
  name: string          // 和名（署名・必須）
  nameEn?: string       // 英表記（任意）
  title?: string        // 肩書・所属
  bio?: string          // 自己紹介文（1〜2文）
  avatarUrl?: string    // 顔写真。無ければイニシャル表示にフォールバック
}

export const AUTHORS: Record<string, AuthorProfile>
```

### 記事側 — `lib/news-data.ts` の `NewsArticle` に追加（どちらも任意）

- `authorId?: string` — ロスターを参照（主に in-memory シード用）
- `author?: Partial<AuthorProfile>` — 記事個別の著者プロフィール（Admin フォーム入力・DB 由来）

### 解決ヘルパー — `lib/authors.ts`

```ts
export function resolveArticleAuthor(article): AuthorProfile | null
export function coerceAuthorInput(value: unknown): Partial<AuthorProfile> | undefined
```

- `resolveArticleAuthor`: `authorId` でロスターを引く → `author` でフィールド単位マージ（個別指定が優先）。どちらにも `name` が無ければ `null`（= 枠を出さない）。
- `coerceAuthorInput`: 信頼できないリクエストボディを著者オーバーライドに整形（文字列トリム・空欄除去・`name` 必須）。POST/PATCH ルート共用。

### 永続化 — Supabase

- マイグレーション `0006_column_author.sql`: `articles` に `author_name` / `author_title` / `author_bio` / `author_avatar_url`（全 nullable）を追加。
- `lib/supabase/article-repository.ts`: `ARTICLE_SELECT`・`ArticleRow`・`rowToArticle`（→ `article.author`）・`toRowInsert`・`updateArticle` で読み書き。カテゴリがコラム以外に変わった更新では著者カラムをクリア。
- API: `POST /api/admin/articles` と `PATCH /api/admin/articles/[id]` で `coerceAuthorInput` を通して `author` を受け取る。

### Admin フォーム — `components/admin/article-form-dialog.tsx`

- `category === "column"` のときのみ「執筆者プロフィール」セクションを表示。
- 項目: ロスタープリフィル `<Select>`（任意・選ぶと各欄へ流し込み）／執筆者名／肩書・所属／自己紹介文／顔写真（URL 入力＋`/api/admin/upload-image` 再利用のファイルアップロード＋プレビュー）。
- 保存ペイロードは常に `author` キーを送る（コラム以外は `null`）ので、カテゴリ切替時に古い著者が消える。

## UI コンポーネント — 新規 `components/column-author-card.tsx`

`<ColumnAuthorCard author={AuthorProfile} />` — 純粋な表示コンポーネント。

- レイアウト: 既存 article-view の `rounded-md border bg-secondary/30` 系トーンに合わせたカード。
- 見出し「この記事の執筆者」。
- 左に円形アバター（`components/ui/avatar.tsx` を利用）。`avatarUrl` 無しなら名前先頭文字のイニシャルを `AvatarFallback` で表示。
- 右に名前（和名＋英表記を小さく併記）・肩書・自己紹介文。
- `title` / `bio` / `nameEn` / `avatarUrl` はいずれも任意 → 存在する項目だけ条件付きで描画。

## 表示条件 — `components/article-view.tsx`

- `resolveArticleAuthor(article)` が著者を返し、かつ `isEditorial` の場合のみ表示。
- 挿入位置: 本文 `<section>`（要約パラグラフ）の直後、**参考記事セクションの前**。
- 著者が解決できないコラムは従来どおり枠なし（後方互換）。

## シードデータ — `lib/news-data.ts`

- ロスター（`lib/authors.ts`）に初期著者を 2〜3 名定義（編集部／寄稿の購買責任者／インタビュー担当など）。中身は差し替え前提のプレースホルダー。Admin フォームのプリフィル候補にもなる。
- 既存のコラム/インタビューのシード記事（id 7・10 等）に `authorId` を付与（Supabase 未設定時の in-memory 表示デモ用）。

## テスト

- `lib/authors.test.ts`（node `--experimental-strip-types --test`）で `resolveArticleAuthor` を検証:
  - ロスターのみ → ロスター値
  - 個別上書きのみ → inline 値
  - 両方 → フィールド単位マージ（個別優先）
  - どちらも無し → `null`
- `package.json` に `test:authors` スクリプトを追加。
- 最終検証は `tsc --noEmit`。

## 後方互換性

- 追加フィールドは全て任意。既存記事・既存 Supabase 行は影響を受けない。
- `QUALITY_CHECK` 等の他経路には触れない。
