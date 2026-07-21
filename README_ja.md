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
  価格表ページ。無料会員登録フォームもここに置いています。
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

## LINEログイン

ログイン画面と新規登録画面は、アプリ内の LINE Authorization Code Flow と Supabase Auth のセッションを連携しています。Supabase のカスタム OIDC provider は使用しません。

1. LINE Developers Console で LINE Login チャネルを作成し、Web app を有効にします。
2. Go India の Messaging API チャネルと LINE Login チャネルを同じ Provider に置き、LINE Login チャネルの `Linked LINE Official Account` に Go India を設定します。
3. Callback URL に `http://localhost:3000/api/auth/line/callback` と本番URLの `/api/auth/line/callback` を登録します。
4. `.env` に `LINE_CHANNEL_ID`、`LINE_CHANNEL_SECRET`、固定の `LINE_SESSION_SECRET` を設定します。

ログイン時は `bot_prompt=aggressive` で友だち追加を案内し、コールバック時に LINE の friendship status API で `friendFlag=true` を確認できた場合だけ、Go India 経由のフルアクセスを付与します。

## β版アンケートとアクセス開放

安全な適用順は、アプリを `BETA_ACCESS_ENABLED=0` のままデプロイし、`supabase/migrations/0009_beta_access.sql` を適用してから、`BETA_ACCESS_ENABLED=1` にして再デプロイする流れです。有効化すると次の導線が動きます。

1. 既存ユーザーは移行時にフルアクセスを維持します。
2. 新規ユーザーは `beta_preview_articles` に登録された最大10記事を全文閲覧できます。
3. 異なる5記事を各15秒以上読むと `/beta/survey` のアンケートに回答できます。
4. 回答送信とフルアクセス付与は1つのDBトランザクションで行われます。
5. Go India の友だち状態をLINE APIで確認できたユーザーもフルアクセスになります。

本番では `.env` に独立した固定値の `BETA_READ_SECRET` を設定してください。体験記事を入れ替える場合は `beta_preview_articles` の `active` と `display_order` を更新します。記事本文・出典情報は匿名Supabase APIから取得できず、公開一覧には明示的に絞ったティーザー情報だけを渡します。

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
