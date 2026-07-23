# IndoBiz Japan

日本企業向けのインド市場インテリジェンス v1。  
ニュース一覧型のホームで複数記事を一画面に見せつつ、記事詳細では約500字の要約と日本企業への示唆、`為替・市況` カテゴリでは `為替 / 株式 / 金利 / 原油` の4指標を表示します。

スクレイピング結果は「原文URLが記事ページであること」を満たすものだけ公開対象にし、記事詳細には検証情報（原文URL・取得方式・根拠スニペット）を表示します。

## Current Shape

- カテゴリは `経済 / 規制 / 社会 / 文化 / 為替・市況 / コラム`
- ホームはニュース一覧型で、先頭1件の注目記事 + 2カラムの記事一覧
- 価格は `/pricing`、お問い合わせは `/contact`
- 記事モデルは `summary` と `marketSnapshot`、`provenance` を持つ
- `workflowStatus` が `review` または `failed` の記事は公開一覧から除外
- `sourceUrl` が記事URL判定を満たさないドラフトは `failed` 扱い

## Key Files

- `app/page.tsx`
  ホームの一覧ページ。
- `app/pricing/page.tsx`
  ベータ版と本リリース後の料金案内ページ。
- `app/extend-code/page.tsx`
  アンケート回答者向けの延長コード入力ページ。
- `lib/supabase/beta-access.ts`
  ログインユーザーごとの無料期間をDBで開始・確認・延長するサーバー処理。
- `app/contact/page.tsx`
  問い合わせ専用ページ。
- `components/news-list.tsx`
  ホームの一覧UIと検索・カテゴリ・業界タグフィルタ。
- `components/news-card.tsx`
  注目記事カード、通常記事カード、為替・市況の4指標表示。
- `components/article-view.tsx`
  記事詳細の表示。500字要約、関連記事、問い合わせCTAに加えて、検証情報（原文URL・canonical URL・根拠スニペット）を表示します。
- `lib/news-data.ts`
  記事型、カテゴリ、`MarketSnapshot`、シードデータ。
- `lib/site-config.ts`
  価格プラン、会員登録、問い合わせ型の設定。
- `lib/automation.ts`
  RSS/API 前提の source connector と、重複排除・要約・示唆生成・公開可否判定（記事URL品質ゲート）の基盤関数。
- `lib/source-url-utils.ts`
  記事URL判定と表示用ソースURL解決のユーティリティ。
- `scripts/python/fetch_india_news.py`
  Python スクレイパー本体。複数 RSS + 任意の GNews API 取得、最終URL解決、証拠スニペット抽出、provenance 付与を実施。
- `app/api/scrape/python/route.ts`
  Python スクレイパー実行エンドポイント。結果を自動化パイプラインに流し込み、`published/review/failed` 件数を返却。

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## Validation

```bash
./node_modules/.bin/tsc --noEmit
npm run build
```

## ベータ版アクセス設定

記事の閲覧にはログインが必要です。ログイン済みユーザーが初めてサイトへアクセスした日時を `beta_access` テーブルへ保存し、その時点から14日間は全記事を閲覧できます。期間終了後、アンケート回答者が共通コードを `/extend-code` へ入力すると、同じアカウントを1回だけ14日間延長します。

`supabase/migrations/0009_beta_access.sql` を適用してから公開してください。残り日数を毎日保存するのではなく、開始日時・延長開始日時をDBへ保存し、サーバー時刻から期限を判定します。以前の匿名 `localStorage` 値は使用せず、移行後の初回表示時に削除します。

Googleフォームの公開URLを環境変数へ設定してください。

```bash
NEXT_PUBLIC_BETA_SURVEY_URL=https://docs.google.com/forms/d/e/FORM_ID/viewform
BETA_EXTENSION_CODE=IBDJ-EXTEND-2026
```

Googleフォームの回答完了メッセージには、延長コード `IBDJ-EXTEND-2026` と `https://indobiz-japan.launchers-g.com/extend-code` への戻りリンクを記載します。

## LINEログイン

ログイン画面と新規登録画面は、Supabase Auth のカスタム OIDC provider 経由で LINE ログインに対応しています。ボタンを試す前に、外部 provider 側を設定してください。

1. LINE Developers Console で LINE Login チャネルを作成し、Web app を有効にします。
2. Supabase Dashboard → Auth → Providers でカスタム OIDC provider を作成します。identifier は `custom:line`、issuer は `https://access.line.me`、scopes は `openid profile email`、client ID/secret は LINE のチャネルID/チャネルシークレットを設定します。
3. Supabase が表示する callback URL を、LINE Login チャネルの callback URL に追加します。
4. Supabase Auth の redirect allow list に `http://localhost:3000/auth/callback` と本番 URL の `/auth/callback` を追加します。
5. `email` scope を使うため、LINE Developers Console でメールアドレス取得権限を申請します。

## Scraping Execution

Python バックエンド経由での取得とパイプライン実行を追加しました。

```bash
npm run scrape:fetch
npm run scrape:run
```

- `scrape:fetch`
  Python スクレイパーを直接実行します。既定ではフォールバック記事を生成しません。
- `scrape:run`
  Python 取得結果を `POST /api/scrape/run` に送信して自動化パイプラインを実行します。
- 管理画面 `/admin` の `スクレイピング実行` ボタンは `POST /api/scrape/python` を呼び出し、取得結果をそのまま記事一覧に取り込みます。

補足:

- 既定コネクタは Reuters / PIB に加えて Google News RSS（Business, Manufacturing, Logistics, Policy）を利用します。
- `GNEWS_API_KEY` を設定すると、GNews API からの収集も自動で有効化されます。
- 任意で `GNEWS_QUERY`, `GNEWS_LANG`, `GNEWS_COUNTRY` で取得条件を調整できます。
- `scripts/python/fetch_india_news.py --allow-fallback` を付けた場合のみ、全ソース失敗時に synthetic fallback を出力します。
- TypeScript 側パイプラインでも URL 品質ゲートを行うため、Python 側を通過した後でも公開可否が再判定されます。
- 原文検証のために `provenance.evidenceSnippets` を記事詳細で表示します。

GNews API の設定例:

```bash
export GNEWS_API_KEY="your_api_key"
export GNEWS_QUERY="india business OR india economy OR india infrastructure"
export GNEWS_LANG="en"
export GNEWS_COUNTRY="in"
npm run scrape:fetch
```

## Notes

- 問い合わせフォームと後援会入会フォームは Web3Forms 経由で送信し、`form_source` で送信元を判別できます。
- `為替・市況` は現在静的データで管理しています。
- 自動化基盤はローカルのサンプル実装で、本番の RSS/API 接続先は `lib/automation.ts` の `SOURCE_CONNECTORS` から差し替えられます。
