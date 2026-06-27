# コラム執筆者紹介枠 — 設計

## 目的

コラム記事に「誰が書いたか」が分かる執筆者紹介枠を追加する。読者が筆者の専門性・立場を把握できるよう、名前・肩書・顔写真・短い自己紹介文を本文末尾に表示する。

## スコープ

- 対象は editorial 記事のみ（`contentType !== "news" || category === "column"`）。ニュース記事には表示しない。
- 著者データは **ロスター（共通定義）＋記事個別上書き** の二段構え。
- ビルド検証は `./node_modules/.bin/tsc --noEmit`。`resolveArticleAuthor()` の解決ロジックは node 組み込みテストランナーでユニットテストを追加。
- **対象外**: Supabase への著者カラム追加（コラムを DB から生成する経路は現状存在せず、コラムは in-memory シードのみ）。将来コラムを永続化する場合に `author_id` 列を足す前提で型だけ用意しておく。

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

- `authorId?: string` — ロスターを参照
- `author?: Partial<AuthorProfile>` — 記事個別の上書き／一回限りの寄稿者用

### 解決ヘルパー — `lib/authors.ts`

```ts
export function resolveArticleAuthor(article): AuthorProfile | null
```

- `authorId` でロスターを引く → `author` でフィールド単位マージ（個別指定が優先）。
- ロスターにも個別指定にも `name` が無ければ `null`（= 枠を出さない）。
- マージ結果の `id` はロスター ID もしくは `author.id` もしくは `"inline"` を採用。

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

- ロスターに初期著者を 2〜3 名定義（編集部／寄稿の購買責任者／インタビュー担当など）。中身は差し替え前提のプレースホルダー。
- 既存のコラム/インタビューのシード記事（id 7・10 等）に `authorId` を付与。

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
