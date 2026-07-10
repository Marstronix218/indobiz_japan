# 都市情報の拡張：天気・気候・名物・生活情報

**日付:** 2026-07-10
**状態:** 設計確定（実装計画待ち）

## 背景

現在、都市情報は `components/sidebar-widgets.tsx` の `CitySpotlightWidget` にのみ存在する。9都市（Mumbai / Delhi NCR / Gurgaon / Bengaluru / Chennai / Pune / Hyderabad / Ahmedabad / Kolkata）のデータが同ファイル内の `CITIES` 配列にべた書きされており、人口・GDP・一言メモ・画像だけを幅320px前後のサイドバーカードで表示している。

## 目的

**インドへの出張・駐在を準備する日本企業の担当者**が、渡航時期・持ち物・住居・医療・移動手段を判断できるようにする。読み物としての彩りではなく、実務判断に使える情報の深さを狙う。

## スコープ外（YAGNI）

- 都市別の記事アーカイブ／記事との紐付け
- 都市データの Supabase 永続化（静的データで足りる）
- 都市の追加 UI・管理画面
- 天気以外のライブデータ

## 設計

### 1. データ層：`lib/cities/`

`sidebar-widgets.tsx` から `CITIES` を切り出し、都市ページとサイドバーの両方が読む単一の情報源にする。`lib/authors.ts`（静的ロスター）の先例に倣う。

```
lib/cities/
  types.ts      City / CitySpecialty / CityLiving / CityClimate 型
  data.ts       9都市の確定データ（唯一の真実）
  climate.json  Open-Meteo 実測から生成した月別平年値（生成物・コミット対象）
  index.ts      listCities() / getCity(slug)
```

各都市に URL 用 `slug` を追加する（`mumbai`, `delhi-ncr`, `gurgaon`, `bengaluru`, `chennai`, `pune`, `hyderabad`, `ahmedabad`, `kolkata`）。既存フィールド（`name` / `jp` / `tag` / `pop` / `gdp` / `note` / `tone` / `imageUrl` / `imageCredit`）はそのまま残し、以下を追加する。

```ts
type CitySpecialty = {
  jp: string                                  // 「ヴァダパヴ」
  kind: "料理" | "工芸" | "祭事" | "土産"
  note: string                                // 1〜2文
}

type CityLiving = {
  housing: {
    areas: string[]
    rents: { layout: string; minUsd: number; maxUsd: number }[]
    note: string
  }
  safetyHealth: {
    safetyNote: string
    hospitals: { name: string; note: string }[]
    healthNote: string
  }
  transport: {
    fromAirport: string
    inCity: string
    directFlightFromJapan: string
    commuteNote: string
  }
  japaneseCommunity: {
    association?: string
    schools: string[]
    groceries: string[]
    corporateNote: string
  }
  /** この数値・固有名詞を確認した年月。例: "2026-07" */
  verifiedAt: string
}
```

`verifiedAt` は人の検収日ではなく「情報の時点」を表す。家賃相場・病院情報は必ず陳腐化するため、UI に時点を明示して読者に鮮度を判断させる。数値を出しながら時点を示さないのは不誠実である。

渡航適期は `City` 直下に持つ。

```ts
  /** 渡航適期・回避月。1〜12。互いに重複しない。avoidMonths は空配列可 */
  bestMonths: number[]
  avoidMonths: number[]
```

これらは `climate.json` からではなく `data.ts` に手で書く。降水量の閾値から機械的に導出すると、年中穏やかで「避ける月」が存在しないベンガルールのような都市で不自然な結果になる。`climate.json` は観測値のみを持ち、判断を含まない。

### 2. 執筆方針（正確性）

生活情報は Claude が執筆し、静的データとしてコミットする。人間による検収工程は置かない。ただし、本リポジトリの CLAUDE.md が記録している通り「薄い根拠で LLM に書かせると事実を捏造する」ため、記述を2層に分ける。

**記憶から書いてよい層** — 駐在エリア名、空港から市内の交通手段、日本人会の有無、名物、街の性格。構造的知識であり信頼できる。

**裏取りが必要な層** — 家賃のドル金額、具体的な病院名、日本人学校名。`WebSearch` で確認してから書く。**確認が取れなかった項目は推測で埋めず、その項目ごと落とす。** 誤った病院名は読者に実害を与える。

LLM は実行時の依存にならない。生成物は人間が読めるコミット済み TypeScript である。

### 3. 気候データ（静的・実測由来）

`scripts/fetch-city-climate.mjs` を一度だけ手動実行する。Open-Meteo Archive API から各都市の 2015–2024 年の日次データ（最高気温・最低気温・降水量）を取得し、月別に集計して `lib/cities/climate.json` に書き出す。APIキー不要。緯度経度をカンマ区切りで渡せるため9都市を1リクエストで取得できる。

出力形式：都市 slug ごとに12ヶ月分の `{ month, avgHighC, avgLowC, avgRainMm }`。

生成物をコミットするため、Vercel のビルドもランタイムも外部 API に触れない。更新は年1回スクリプトを再実行するだけ。12ヶ月 × 9都市の気温を Claude の記憶から書くより、実測集計のほうがはるかに正確である。

### 4. ライブ天気（唯一の動的要素）

`app/api/city-weather/route.ts` が Open-Meteo forecast API を叩き、9都市分をまとめて `{ [slug]: { tempC, weatherCode } }` を返す。`revalidate: 1800`（30分キャッシュ）により実際の外部呼び出しは1日48回程度。

**フェイルオープン:** 失敗時は 500 ではなく `{ unavailable: true }` を 200 で返す。UI は天気行を消すだけで、他の内容は静的なため通常通り表示される。天気のために都市ページが落ちるのは割に合わない。既存の `components/data-unavailable.tsx` と同じ思想。

### 5. ページと UI

**`app/city/[slug]/page.tsx`** — RSC。`generateStaticParams()` で9都市を静的生成。動的なのは天気1行のみで、そこを `<Suspense>` で包み静的シェルを即座に返す。

構成（上から）：

1. ヒーロー（都市画像・日本語名／英名・人口・GDP・今の天気）
2. 気候カレンダー（12ヶ月の気温レンジ＋降水量）
3. 名物
4. 生活情報 4ブロック（住居 / 治安・医療 / 交通 / 日本人コミュニティ）
5. 注記：「情報は{verifiedAt}時点。渡航前に最新情報をご確認ください」

**`app/city/page.tsx`** — 9都市の一覧。`/city` の404回避と、都市ページ群への単一の入口を兼ねる。

**`components/sidebar-widgets.tsx`** — 既存レイアウトを維持し、天気1行と「都市データを見る →」リンクを追加。カードは回遊のためのティーザーで、実務準備の本体は都市ページ側に置く。

気候カレンダーはチャートであるため、実装前に `dataviz` スキルを読み、既存の `ImagePlaceholderTone` と矛盾しない配色にする。

### 6. 検証

`lib/cities/data.test.ts` を追加し、`package.json` に `test:cities`（`node --experimental-strip-types --test lib/cities/data.test.ts`、既存 `test:authors` と同形式）を足す。

検査項目：

- `slug` がユニーク
- 9都市すべてが必須フィールドを持つ
- `climate.json` に全 slug × 12ヶ月が揃っている
- 家賃レンジが `minUsd <= maxUsd`
- `bestMonths` / `avoidMonths` が 1〜12 の範囲で、互いに重複しない

データがハードコードである以上、型チェックでは「コルカタの生活情報を書き忘れた」を検出できない。そこが唯一の壊れどころなのでテストで塞ぐ。あわせて `tsc --noEmit` を通す。

## 変更ファイル一覧

**新規**

- `lib/cities/types.ts` / `data.ts` / `climate.json` / `index.ts`
- `lib/cities/data.test.ts`
- `app/city/page.tsx`
- `app/city/[slug]/page.tsx`
- `app/api/city-weather/route.ts`
- `scripts/fetch-city-climate.mjs`

**変更**

- `components/sidebar-widgets.tsx` — `CITIES` を削除し `lib/cities` から import。天気行と都市ページへのリンクを追加
- `package.json` — `test:cities` スクリプト追加

## 実装上の注意

最も重い作業はコードではなく、9都市分の生活情報を裏取りしながら執筆する部分である。実装計画では都市ごとに独立したタスクとして分割する。
