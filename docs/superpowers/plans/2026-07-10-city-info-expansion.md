# 都市情報拡張 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9都市の詳細ページを新設し、ライブ天気・実測ベースの気候カレンダー・名物・生活情報（住居/治安医療/交通/日本人コミュニティ）を提供する。

**Architecture:** 都市データは `lib/cities/` に静的 TypeScript として集約する（Supabase を使わない）。気候は Open-Meteo Archive API の実測値から一度だけ生成してコミットする。動的要素は現在天気のみで、RSC は `lib/cities/weather.ts` を直接呼び、クライアントコンポーネント（サイドバー）は `/api/city-weather` 経由で同じ関数を叩く。天気取得の失敗はフェイルオープンし、天気行だけが消える。

**Tech Stack:** Next.js 16 (App Router / RSC), React 19, TypeScript, Tailwind + shadcn/ui, `node:test` + `--experimental-strip-types`, Open-Meteo API（APIキー不要）

## Global Constraints

- 検証コマンドは `./node_modules/.bin/tsc --noEmit` と `npm run test:cities`。`npm run lint` は eslint 未インストールのため**使わない**（`package.json` に定義はあるが失敗する）。
- 人間が原稿を書く工程は存在しない。すべて実装者（Claude）が執筆し、実装者が独立検証する。
- **事実の捏造禁止。** 固有名詞・数値は `WebSearch` で裏を取ってから書く。確認が取れなかった項目は推測で埋めず、その項目ごと落とす。
- `verifiedAt` は「情報の時点」であり人の検収日ではない。値は `"2026-07"`。
- 生活情報の密度は都市によって不揃いになる。揃えるために推測を書かない。
- 既存のサイドバーカードの見た目を変えない（天気1行とリンク1本の追加のみ）。
- **import 規則（厳守）。** `node --experimental-strip-types` は `@/*` パスエイリアスも拡張子なし相対 import も解決できない。既存 `lib/authors.ts` が import を1行も持たないのはこのためである。したがって:
  - `lib/cities/types.ts` は**いかなる import も持たない**（`ImagePlaceholderTone` を借りず、同一の union を `CityTone` として自前で定義する）。
  - `data.ts` / `climate.ts` は `import type` のみ使う。型のみの import は実行時に完全に消えるため、node が解決を試みない。
  - `index.ts` / `weather.ts` は Next からしか読まれないので拡張子なし相対 import でよい。
  - テストとスクリプトは `.ts` 拡張子付きで import する（`tsconfig.json` の `allowImportingTsExtensions: true` により tsc も通る）。
  - **テストから `index.ts` を import しない**（`index.ts` は実行時に `./data` を拡張子なしで読むため node が落ちる）。
- 新規 UI は `components/ui/` の shadcn プリミティブと既存 Tailwind トークン（`border-border` / `bg-card` / `text-muted-foreground` / `text-accent`）に従う。
- コミットは各タスク末尾で行う。

## 設計からの逸脱（1件）

spec は `lib/cities/climate.json` としているが、**`lib/cities/climate.ts`（型付き const を export）** に変更する。理由は、`node --experimental-strip-types` でのテスト実行時に JSON import が `with { type: "json" }` を要求し、TS/Next 側の `resolveJsonModule` と噛み合わせる必要が生じるため。TS ファイルにすれば import 摩擦がゼロになり、`CityClimate` 型で構造を保証できる。生成物をコミットする方針は spec のまま変わらない。

## ファイル構成

**新規**

| ファイル | 責務 |
|---|---|
| `lib/cities/types.ts` | `City` / `CitySpecialty` / `CityLiving` / `CityClimate` 型のみ |
| `lib/cities/data.ts` | 9都市の確定データ（唯一の真実） |
| `lib/cities/climate.ts` | Open-Meteo 実測から生成した月別平年値（生成物） |
| `lib/cities/weather-codes.ts` | WMO weather code → 日本語ラベル |
| `lib/cities/weather.ts` | `fetchCityWeather()` — RSC と API ルートが共有 |
| `lib/cities/index.ts` | `listCities()` / `getCity(slug)` |
| `lib/cities/data.test.ts` | 構造テスト |
| `app/api/city-weather/route.ts` | クライアント用の天気エンドポイント |
| `app/city/page.tsx` | 9都市一覧 |
| `app/city/[slug]/page.tsx` | 都市詳細 |
| `components/city/climate-calendar.tsx` | 気候カレンダー |
| `components/city/living-sections.tsx` | 生活情報4ブロック |
| `scripts/fetch-city-climate.mjs` | 気候生成スクリプト（一度だけ実行） |
| `docs/city-fact-check-2026-07.md` | 第2パス検証ログ |

**変更**

| ファイル | 変更内容 |
|---|---|
| `components/sidebar-widgets.tsx:245-366` | `City` 型と `CITIES` 配列を削除し `@/lib/cities` から import。天気行 + 都市ページリンクを追加 |
| `package.json:18` | `test:cities` スクリプト追加 |

## 都市コンテンツ執筆プロトコル（Task 6〜14 共通）

各都市タスクは以下の5ステップを**その都市だけについて**完了させる。9都市まとめて執筆してから検証に回すことは禁止（検証が形骸化するため）。

1. **第1パス（執筆）** — `WebSearch` で裏を取りながら、その都市の `specialties` と `living` を `lib/cities/data.ts` に追記する。
2. **第2パス（独立検証）** — 第1パスの検索結果を参照せず、書かれた固有名詞・数値を1件ずつ**別のクエリで**再検索して突き合わせる。検証対象は「病院名 / 日本人学校・日本人会 / 家賃レンジ / 直行便の有無 / 駐在エリア名」。
3. **判定を3値で下す** — 確認できた→残す。矛盾した→修正または削除。**確認できなかった→削除**。
4. **検証ログ追記** — `docs/city-fact-check-2026-07.md` に「都市 / 項目 / 記述 / 判定 / 出典URL」の行を追加する。
5. **検証 → コミット** — `./node_modules/.bin/tsc --noEmit` と `npm run test:cities` を通してコミット。

`living` と `specialties` を**任意フィールド**にしているのは、この削除が実際に起きるからである。UI は存在するブロックだけを描画する。全都市が揃っているかの完全性ゲートは Task 15 で初めて掛ける。

---

### Task 1: 型定義とデータ層の骨格

`sidebar-widgets.tsx` にべた書きされた `CITIES` を `lib/cities/` へ移す。この時点では新フィールドの中身は空で、**見た目は一切変わらない**。

**Files:**
- Create: `lib/cities/types.ts`
- Create: `lib/cities/data.ts`
- Create: `lib/cities/index.ts`
- Create: `lib/cities/data.test.ts`
- Modify: `components/sidebar-widgets.tsx:245-366`
- Modify: `package.json:18`

**Interfaces:**
- Consumes: なし（`types.ts` は import を持たない）
- Produces: `CityTone`, `City`, `CitySpecialty`, `CityLiving`, `ClimateMonth`, `CityClimate` 型 / `CITIES`, `listCities()`, `getCity(slug)`

- [ ] **Step 1: 失敗するテストを書く**

`lib/cities/data.test.ts`:

`index.ts` は import しない（Global Constraints の import 規則を参照）。`getCity` / `listCities` は `Array.find` / 恒等関数の薄いラッパーであり、テストするのは `CITIES` の中身である。

```ts
import assert from "node:assert/strict"
import { test } from "node:test"

import { CITIES } from "./data.ts"

test("9都市が存在する", () => {
  assert.equal(CITIES.length, 9)
})

test("slug がユニーク", () => {
  const slugs = CITIES.map((c) => c.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})

test("全都市が必須の基本フィールドを持つ", () => {
  for (const city of CITIES) {
    assert.ok(city.slug, `${city.name}: slug`)
    assert.ok(city.jp, `${city.name}: jp`)
    assert.ok(city.tag, `${city.name}: tag`)
    assert.ok(city.pop, `${city.name}: pop`)
    assert.ok(city.gdp, `${city.name}: gdp`)
    assert.ok(city.note, `${city.name}: note`)
    assert.equal(typeof city.lat, "number", `${city.name}: lat`)
    assert.equal(typeof city.lon, "number", `${city.name}: lon`)
  }
})

test("mumbai の slug が引ける", () => {
  assert.equal(CITIES.find((city) => city.slug === "mumbai")?.jp, "ムンバイ")
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `node --experimental-strip-types --test lib/cities/data.test.ts`
Expected: FAIL — `Cannot find module './data.ts'`

- [ ] **Step 3: 型を定義**

`lib/cities/types.ts`:

```ts
/**
 * 都市データの型。
 *
 * `lib/authors.ts` と同じく静的ロスターであり、Supabase には保存しない。
 * `specialties` / `living` が任意なのは、事実確認が取れなかった項目を
 * 推測で埋めずに落とす方針のため（docs/city-fact-check-2026-07.md 参照）。
 *
 * このファイルは import を持たない。data.test.ts は node の
 * --experimental-strip-types で実行され、@/* パスエイリアスを解決できないため。
 * CityTone は lib/news-data.ts の ImagePlaceholderTone と同一の union だが、
 * 依存を避けるためあえて再定義している。
 */
export type CityTone = "warm" | "cool" | "green" | "default"

export type CitySpecialty = {
  jp: string
  kind: "料理" | "工芸" | "祭事" | "土産"
  note: string
}

export type CityLiving = {
  housing?: {
    areas: string[]
    rents: { layout: string; minUsd: number; maxUsd: number }[]
    note: string
  }
  safetyHealth?: {
    safetyNote: string
    hospitals: { name: string; note: string }[]
    healthNote: string
  }
  transport?: {
    fromAirport: string
    inCity: string
    directFlightFromJapan: string
    commuteNote: string
  }
  japaneseCommunity?: {
    association?: string
    schools: string[]
    groceries: string[]
    corporateNote: string
  }
  /** この数値・固有名詞を確認した年月。例: "2026-07" */
  verifiedAt: string
}

/** climate.ts の1ヶ月ぶんの観測平均。判断を含まない。 */
export type ClimateMonth = {
  month: number
  avgHighC: number
  avgLowC: number
  avgRainMm: number
}

export type CityClimate = {
  slug: string
  months: ClimateMonth[]
}

export type City = {
  slug: string
  name: string
  jp: string
  tag: string
  pop: string
  gdp: string
  note: string
  tone: CityTone
  lat: number
  lon: number
  imageUrl?: string
  imageCredit?: string
  /** 渡航適期・回避月。1〜12。互いに重複しない。avoidMonths は空配列可 */
  bestMonths?: number[]
  avoidMonths?: number[]
  specialties?: CitySpecialty[]
  living?: CityLiving
}
```

- [ ] **Step 4: データを移設**

`lib/cities/data.ts` を作り、`components/sidebar-widgets.tsx:257-366` の `CITIES` 配列を**内容を一字も変えずに**移す。各都市に `slug` / `lat` / `lon` を追加する。

`import type` であることが重要（実行時に消えるため node が `./types` を解決しに行かない）。

```ts
import type { City } from "./types"

export const CITIES: City[] = [
  {
    slug: "mumbai",
    name: "Mumbai",
    jp: "ムンバイ",
    tag: "金融・港湾",
    pop: "2,041万",
    gdp: "$3,100億",
    note: "西部回廊の物流ハブ。港湾混雑が緩和傾向で完成車・部品の輸送リードタイムが安定化。",
    tone: "warm",
    lat: 19.076,
    lon: 72.8777,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg",
    imageCredit: "Bandra-Worli Sea Link · Wikimedia",
  },
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    jp: "デリー首都圏",
    tag: "二輪・電装・行政",
    pop: "3,200万",
    gdp: "$3,700億",
    note: "Honda・Yamaha・Maruti Suzuki の量産拠点が集中。中央官庁との折衝・規制対応の起点。",
    tone: "cool",
    lat: 28.6139,
    lon: 77.209,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg",
    imageCredit: "Jama Masjid · Wikimedia",
  },
  {
    slug: "gurgaon",
    name: "Gurgaon",
    jp: "グルガオン",
    tag: "IT・GCC・R&D",
    pop: "150万",
    gdp: "$420億",
    note: "NCR の高層オフィス集積地。日系を含む GCC や外資系本社機能の受け皿として存在感が強い。",
    tone: "cool",
    lat: 28.4595,
    lon: 77.0266,
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DLF%20Cyber%20Hub,%20Gurgaon%202.jpg",
    imageCredit: "DLF Cyber Hub, Gurgaon · Wikimedia",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    jp: "ベンガルール",
    tag: "IT・GCC・R&D",
    pop: "1,330万",
    gdp: "$1,100億",
    note: "日系GCC(グローバル・キャパビリティ・センター)設置の最有力候補。女性エンジニア比率が上昇傾向。",
    tone: "green",
    lat: 12.9716,
    lon: 77.5946,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg",
    imageCredit: "Bengaluru skyline · Wikimedia",
  },
  {
    slug: "chennai",
    name: "Chennai",
    jp: "チェンナイ",
    tag: "自動車・部品",
    pop: "1,170万",
    gdp: "$840億",
    note: "日系自動車・部品の集積地。タミル・ナードゥ州が人材定着・電動化補助の制度運用で先行。",
    tone: "cool",
    lat: 13.0827,
    lon: 80.2707,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/32/Chennai_Central.jpg",
    imageCredit: "Chennai Central · Wikimedia",
  },
  {
    slug: "pune",
    name: "Pune",
    jp: "プネ",
    tag: "製造・自動車",
    pop: "720万",
    gdp: "$690億",
    note: "Bajaj・Volkswagen・Tata Motors の重工業ベルト。日系工作機械・部品メーカーの集積も進む。",
    tone: "warm",
    lat: 18.5204,
    lon: 73.8567,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pune_West_skyline_-_March_2017.jpg/1280px-Pune_West_skyline_-_March_2017.jpg",
    imageCredit: "Pune West skyline · Wikimedia",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    jp: "ハイデラバード",
    tag: "IT・製薬・半導体",
    pop: "1,100万",
    gdp: "$750億",
    note: "テランガナ州主導でファブ誘致と製薬クラスターを拡大。日系製薬・素材の現地化検討が増加。",
    tone: "green",
    lat: 17.385,
    lon: 78.4867,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Downtown_hyderabad_drone.png",
    imageCredit: "Hyderabad downtown · Wikimedia",
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    jp: "アフマダーバード",
    tag: "半導体・化学",
    pop: "850万",
    gdp: "$680億",
    note: "グジャラート州の半導体クラスター形成が加速。GIFT City で金融・データセンター特区も拡張中。",
    tone: "warm",
    lat: 23.0225,
    lon: 72.5714,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sabarmati_riverside.jpg/1280px-Sabarmati_riverside.jpg",
    imageCredit: "Sabarmati Riverside · Wikimedia",
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    jp: "コルカタ",
    tag: "東部物流・素材",
    pop: "1,500万",
    gdp: "$1,500億",
    note: "東インド・ASEAN接続の起点。鉄鋼・化学の集積地で、北東州への物流ハブとしての存在感が再評価。",
    tone: "cool",
    lat: 22.5726,
    lon: 88.3639,
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/Kolkata_maidan.jpg",
    imageCredit: "Kolkata Maidan · Wikimedia",
  },
]
```

- [ ] **Step 5: アクセサを書く**

`lib/cities/index.ts`。Next からのみ読まれるため拡張子なし相対 import でよい（テストからは import しないこと）。

```ts
import { CITIES } from "./data"
import type { City } from "./types"

export * from "./types"
export { CITIES }

export function listCities(): City[] {
  return CITIES
}

export function getCity(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug)
}
```

- [ ] **Step 6: `package.json` にテストスクリプトを追加**

`package.json:18` の `test:authors` 行の直後に追加（前行末尾のカンマを忘れないこと）:

```json
    "test:cities": "node --experimental-strip-types --test lib/cities/data.test.ts"
```

- [ ] **Step 7: テストが通ることを確認**

Run: `npm run test:cities`
Expected: PASS — 5 tests pass

- [ ] **Step 8: サイドバーを新モジュール参照に切り替え**

`components/sidebar-widgets.tsx` から `type City = {...}`（245-255行）と `const CITIES: City[] = [...]`（257-366行）を**削除**し、import に置き換える。`CitySpotlightWidget` の本体は触らない。

```ts
import { CITIES } from "@/lib/cities"
```

`ImagePlaceholderTone` の import は `TONE_TO_STRIPE` がまだ使うので残す。

- [ ] **Step 9: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし（終了コード 0）

- [ ] **Step 10: コミット**

```bash
git add lib/cities package.json components/sidebar-widgets.tsx
git commit -m "refactor: extract city data from sidebar widget into lib/cities"
```

---

### Task 2: 気候データの生成

Open-Meteo Archive API から2015–2024年の実測値を取り、月別平均に集計して `lib/cities/climate.ts` を生成する。**12ヶ月 × 9都市の気温を記憶から書いてはならない。**

**Files:**
- Create: `scripts/fetch-city-climate.mjs`
- Create: `lib/cities/climate.ts`（スクリプトの出力）
- Modify: `lib/cities/data.test.ts`

**Interfaces:**
- Consumes: `CITIES`（slug/lat/lon）, `CityClimate` / `ClimateMonth` 型
- Produces: `CLIMATE: CityClimate[]`, `getClimate(slug): CityClimate | undefined`

**API 形状（実測済み・2026-07-10 に確認）:** `archive-api.open-meteo.com/v1/archive` に複数地点を渡すと**入力順の配列**が返る。`location_id` は2件目以降にしか付かないため、**インデックスで対応付ける**こと。単一地点だと配列ではなくオブジェクトが返るので、地点ごとに1リクエストする本スクリプトでは配列化しない。

- [ ] **Step 1: 失敗するテストを書く**

`lib/cities/data.test.ts` の末尾に追記:

`assert.ok(x)` は名前空間経由の呼び出しだと TypeScript の assertion-function ナローイングが効かない（"Assertions require every name in the call target to be declared with an explicit type annotation"）。そのため `undefined` の除去には `if (!x) throw` を使う。

```ts
import { CLIMATE, getClimate } from "./climate.ts"

test("climate は全 slug × 12ヶ月を持つ", () => {
  assert.equal(CLIMATE.length, CITIES.length)
  for (const city of CITIES) {
    const climate = getClimate(city.slug)
    if (!climate) throw new Error(`${city.slug}: climate なし`)
    assert.equal(climate.months.length, 12, `${city.slug}: 月数`)
    const months = climate.months.map((m) => m.month)
    assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  }
})

test("climate の値が現実的な範囲に収まる", () => {
  for (const climate of CLIMATE) {
    for (const m of climate.months) {
      assert.ok(m.avgLowC <= m.avgHighC, `${climate.slug}/${m.month}: low > high`)
      assert.ok(m.avgHighC > 0 && m.avgHighC < 55, `${climate.slug}/${m.month}: high 異常`)
      assert.ok(m.avgRainMm >= 0, `${climate.slug}/${m.month}: rain 負値`)
    }
  }
})
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm run test:cities`
Expected: FAIL — `Cannot find module './climate.ts'`

- [ ] **Step 3: 生成スクリプトを書く**

`scripts/fetch-city-climate.mjs`:

```js
/**
 * Open-Meteo Archive API から2015-2024年の日次実測を取得し、
 * 月別平均に集計して lib/cities/climate.ts を生成する。
 *
 * 一度だけ実行して出力をコミットする。CI/ビルドからは呼ばれない。
 *   node scripts/fetch-city-climate.mjs
 *
 * APIキー不要。都市ごとに1リクエストし、レート制限を避けるため間隔を空ける。
 */
import { writeFile } from "node:fs/promises"
import { setTimeout as sleep } from "node:timers/promises"

import { CITIES } from "../lib/cities/data.ts"

const START = "2015-01-01"
const END = "2024-12-31"

async function fetchCity(city) {
  const url =
    `https://archive-api.open-meteo.com/v1/archive` +
    `?latitude=${city.lat}&longitude=${city.lon}` +
    `&start_date=${START}&end_date=${END}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&timezone=UTC`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${city.slug}: HTTP ${res.status}`)
  const json = await res.json()
  const daily = json.daily
  if (!daily?.time?.length) throw new Error(`${city.slug}: daily が空`)

  // month(1-12) -> { highs[], lows[], rainByYear: Map<year, mm> }
  const buckets = new Map()
  for (let i = 0; i < daily.time.length; i++) {
    const date = daily.time[i]
    const year = Number(date.slice(0, 4))
    const month = Number(date.slice(5, 7))
    const high = daily.temperature_2m_max[i]
    const low = daily.temperature_2m_min[i]
    const rain = daily.precipitation_sum[i]
    if (high === null || low === null || rain === null) continue

    if (!buckets.has(month)) {
      buckets.set(month, { highs: [], lows: [], rainByYear: new Map() })
    }
    const bucket = buckets.get(month)
    bucket.highs.push(high)
    bucket.lows.push(low)
    bucket.rainByYear.set(year, (bucket.rainByYear.get(year) ?? 0) + rain)
  }

  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length
  const round1 = (x) => Math.round(x * 10) / 10

  const months = []
  for (let month = 1; month <= 12; month++) {
    const bucket = buckets.get(month)
    if (!bucket) throw new Error(`${city.slug}: ${month}月のデータなし`)
    // 降水量は「年ごとの月間合計」の平均 = 平年の月間降水量
    const yearlyTotals = [...bucket.rainByYear.values()]
    months.push({
      month,
      avgHighC: round1(mean(bucket.highs)),
      avgLowC: round1(mean(bucket.lows)),
      avgRainMm: Math.round(mean(yearlyTotals)),
    })
  }
  return { slug: city.slug, months }
}

const climate = []
for (const city of CITIES) {
  process.stdout.write(`fetching ${city.slug}... `)
  climate.push(await fetchCity(city))
  console.log("ok")
  await sleep(1500) // レート制限回避
}

const body = `/**
 * 月別気候平年値。Open-Meteo Archive API の ${START}〜${END} 実測を集計した生成物。
 *
 * scripts/fetch-city-climate.mjs で再生成する。手で編集しないこと。
 * 観測値のみを持ち、渡航適期などの判断は含まない（判断は data.ts 側）。
 */
import type { CityClimate } from "./types"

export const CLIMATE: CityClimate[] = ${JSON.stringify(climate, null, 2)}

export function getClimate(slug: string): CityClimate | undefined {
  return CLIMATE.find((entry) => entry.slug === slug)
}
`

await writeFile(new URL("../lib/cities/climate.ts", import.meta.url), body)
console.log(`\nwrote lib/cities/climate.ts (${climate.length} cities)`)
```

- [ ] **Step 4: スクリプトを実行**

Run: `node --experimental-strip-types scripts/fetch-city-climate.mjs`
Expected: `fetching mumbai... ok` 〜 `fetching kolkata... ok`、最後に `wrote lib/cities/climate.ts (9 cities)`

（`data.ts` を import するため `--experimental-strip-types` が必要。10年×9都市で1〜2分かかる。）

- [ ] **Step 5: 生成結果を目視で健全性確認**

Run: `node -e "const c=require('fs').readFileSync('lib/cities/climate.ts','utf8'); console.log(c.slice(c.indexOf('mumbai')-20, c.indexOf('mumbai')+400))"`
Expected: ムンバイ1月が最高30℃前後・降水量ほぼ0、7月が降水量数百mm。モンスーンが再現されていること。数値が明らかにおかしければ集計ロジックを疑う。

- [ ] **Step 6: テストが通ることを確認**

Run: `npm run test:cities`
Expected: PASS — 7 tests pass

- [ ] **Step 7: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし

- [ ] **Step 8: コミット**

```bash
git add scripts/fetch-city-climate.mjs lib/cities/climate.ts lib/cities/data.test.ts
git commit -m "feat: generate city climate normals from Open-Meteo archive (2015-2024)"
```

---

### Task 3: 天気取得ロジックと WMO コード変換

RSC とクライアント双方が使う共有関数。ネットワーク失敗は例外を投げず `null` を返す（フェイルオープン）。

**Files:**
- Create: `lib/cities/weather-codes.ts`
- Create: `lib/cities/weather.ts`

**Interfaces:**
- Consumes: `CITIES`
- Produces: `describeWeatherCode(code: number): string`, `fetchCityWeather(): Promise<CityWeatherMap | null>`, `type CityWeather = { tempC: number; weatherCode: number }`, `type CityWeatherMap = Record<string, CityWeather>`

**API 形状（実測済み・2026-07-10 に確認）:** `api.open-meteo.com/v1/forecast` に `latitude=a,b&longitude=c,d` を渡すと**入力順の配列**が返る。各要素は `{ current: { temperature_2m, weather_code } }`。`location_id` は2件目以降にしか付かないので**インデックスで対応付ける**。

- [ ] **Step 1: WMO コード変換を書く**

`lib/cities/weather-codes.ts`:

```ts
/** WMO weather code → 日本語ラベル。Open-Meteo の current.weather_code に対応。 */
const WMO_LABELS: Record<number, string> = {
  0: "快晴",
  1: "晴れ",
  2: "薄曇り",
  3: "曇り",
  45: "霧",
  48: "霧（着氷）",
  51: "霧雨（弱）",
  53: "霧雨",
  55: "霧雨（強）",
  56: "着氷性霧雨",
  57: "着氷性霧雨（強）",
  61: "雨（弱）",
  63: "雨",
  65: "雨（強）",
  66: "着氷性の雨",
  67: "着氷性の雨（強）",
  71: "雪（弱）",
  73: "雪",
  75: "雪（強）",
  77: "霧雪",
  80: "にわか雨（弱）",
  81: "にわか雨",
  82: "にわか雨（激）",
  85: "にわか雪",
  86: "にわか雪（強）",
  95: "雷雨",
  96: "雷雨（雹）",
  99: "雷雨（激しい雹）",
}

export function describeWeatherCode(code: number): string {
  return WMO_LABELS[code] ?? "—"
}
```

- [ ] **Step 2: 天気取得関数を書く**

`lib/cities/weather.ts`:

```ts
import { CITIES } from "./data"

export type CityWeather = { tempC: number; weatherCode: number }
export type CityWeatherMap = Record<string, CityWeather>

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
const REVALIDATE_SECONDS = 1800

/**
 * 全都市の現在天気を1リクエストで取得する。
 *
 * Open-Meteo は複数地点に対し「入力順の配列」を返す（location_id は2件目以降に
 * しか付かないため、インデックスで対応付ける）。
 *
 * フェイルオープン: 失敗時は throw せず null を返す。天気は「あれば嬉しい」情報で
 * あり、これのために都市ページを落とさない。
 */
export async function fetchCityWeather(): Promise<CityWeatherMap | null> {
  const latitudes = CITIES.map((city) => city.lat).join(",")
  const longitudes = CITIES.map((city) => city.lon).join(",")
  const url =
    `${FORECAST_URL}?latitude=${latitudes}&longitude=${longitudes}` +
    `&current=temperature_2m,weather_code&timezone=UTC`

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) return null

    const payload: unknown = await res.json()
    if (!Array.isArray(payload) || payload.length !== CITIES.length) return null

    const map: CityWeatherMap = {}
    payload.forEach((entry, index) => {
      const current = (entry as { current?: { temperature_2m?: number; weather_code?: number } })
        .current
      if (typeof current?.temperature_2m !== "number") return
      if (typeof current?.weather_code !== "number") return
      map[CITIES[index].slug] = {
        tempC: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
      }
    })

    return Object.keys(map).length > 0 ? map : null
  } catch {
    return null
  }
}
```

- [ ] **Step 3: 上流 API の応答を確認**

`weather.ts` は実行時に `./data` を拡張子なしで読むため node から直接 import できない（Global Constraints の import 規則）。上流 API の形だけをここで確認し、`fetchCityWeather()` 自体の疎通は Task 4 で dev サーバ経由で確認する。

Run:

```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=19.076,28.6139&longitude=72.8777,77.209&current=temperature_2m,weather_code&timezone=UTC" | head -c 200
```

Expected: `[{"latitude":19.08...` — **配列**が返り、要素が入力順に並ぶこと。オブジェクトが返る場合は地点が1つしか渡っていない。

- [ ] **Step 4: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add lib/cities/weather.ts lib/cities/weather-codes.ts
git commit -m "feat: add fail-open Open-Meteo current-weather fetcher"
```

---

### Task 4: 天気 API ルート

`sidebar-widgets.tsx` は `"use client"` のため `fetchCityWeather()` を直接呼べない。クライアント用のエンドポイントを設ける。

**Files:**
- Create: `app/api/city-weather/route.ts`

**Interfaces:**
- Consumes: `fetchCityWeather()`
- Produces: `GET /api/city-weather` → `{ weather: CityWeatherMap }` または `{ unavailable: true }`（どちらも HTTP 200）

- [ ] **Step 1: ルートを書く**

`app/api/city-weather/route.ts`:

```ts
import { NextResponse } from "next/server"

import { fetchCityWeather } from "@/lib/cities/weather"

export const revalidate = 1800

/**
 * 現在天気。フェイルオープン: 取得失敗でも 200 + { unavailable: true } を返す。
 * クライアント側は天気行を消すだけで、他の表示に影響させない。
 */
export async function GET() {
  const weather = await fetchCityWeather()
  if (!weather) return NextResponse.json({ unavailable: true })
  return NextResponse.json({ weather })
}
```

- [ ] **Step 2: 開発サーバで確認**

Run: `npm run dev` を別ターミナルで起動し、`curl -s localhost:3000/api/city-weather | head -c 300`
Expected: `{"weather":{"mumbai":{"tempC":29,"weatherCode":53},...}}`

- [ ] **Step 3: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add app/api/city-weather/route.ts
git commit -m "feat: add /api/city-weather endpoint for client components"
```

---

### Task 5: 都市ページのシェル（気候カレンダー込み）

生活情報がまだ空の状態で、ページ・一覧・気候カレンダー・天気表示を完成させる。この時点でページは動作し、名物/生活情報のセクションは（データがないので）描画されない。

**Files:**
- Create: `app/city/page.tsx`
- Create: `app/city/[slug]/page.tsx`
- Create: `components/city/climate-calendar.tsx`

**Interfaces:**
- Consumes: `listCities()`, `getCity()`, `getClimate()`, `fetchCityWeather()`, `describeWeatherCode()`
- Produces: `/city`, `/city/[slug]` ルート

- [ ] **Step 1: dataviz スキルを読む**

気候カレンダーはチャートである。**コードを書く前に** `dataviz` スキルを読み、配色・軸・凡例の指針を得ること。既存の Tailwind トークンと `ImagePlaceholderTone` に矛盾しない色を選ぶ。

- [ ] **Step 2: 気候カレンダーを書く**

`components/city/climate-calendar.tsx`。12ヶ月を行に、気温レンジを水平バー、降水量を数値＋強度で表す。RSC（`"use client"` 不要）。

```tsx
import type { CityClimate } from "@/lib/cities"

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

export function ClimateCalendar({
  climate,
  bestMonths = [],
  avoidMonths = [],
}: {
  climate: CityClimate
  bestMonths?: number[]
  avoidMonths?: number[]
}) {
  const lows = climate.months.map((m) => m.avgLowC)
  const highs = climate.months.map((m) => m.avgHighC)
  const min = Math.floor(Math.min(...lows))
  const max = Math.ceil(Math.max(...highs))
  const span = Math.max(max - min, 1)
  const maxRain = Math.max(...climate.months.map((m) => m.avgRainMm), 1)

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <table className="w-full border-collapse font-mono text-xs">
        <caption className="sr-only">月別の平均気温と降水量</caption>
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="pb-2 text-left font-normal">月</th>
            <th scope="col" className="pb-2 text-left font-normal">気温レンジ</th>
            <th scope="col" className="pb-2 text-right font-normal">最低／最高</th>
            <th scope="col" className="pb-2 text-right font-normal">降水量</th>
          </tr>
        </thead>
        <tbody>
          {climate.months.map((month) => {
            const isBest = bestMonths.includes(month.month)
            const isAvoid = avoidMonths.includes(month.month)
            const left = ((month.avgLowC - min) / span) * 100
            const width = ((month.avgHighC - month.avgLowC) / span) * 100
            return (
              <tr key={month.month} className="border-t border-border/50">
                <th scope="row" className="w-12 py-1.5 text-left font-normal">
                  <span className={isBest ? "font-bold text-accent" : isAvoid ? "text-muted-foreground" : ""}>
                    {MONTH_LABELS[month.month - 1]}
                  </span>
                </th>
                <td className="py-1.5 pr-3">
                  <div className="relative h-2 w-full rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="absolute h-2 rounded-full bg-accent/70"
                      style={{ left: `${left}%`, width: `${Math.max(width, 2)}%` }}
                    />
                  </div>
                </td>
                <td className="w-24 py-1.5 text-right tabular-nums">
                  {month.avgLowC}°／{month.avgHighC}°
                </td>
                <td className="w-24 py-1.5 text-right tabular-nums">
                  <span className={month.avgRainMm >= maxRain * 0.4 ? "font-bold text-foreground" : "text-muted-foreground"}>
                    {month.avgRainMm}mm
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        出典: Open-Meteo（2015〜2024年の実測値を月別に平均）。
        {bestMonths.length > 0 && <> 強調表示は渡航に適した月。</>}
      </p>
    </div>
  )
}
```

- [ ] **Step 3: 都市詳細ページを書く**

`app/city/[slug]/page.tsx`。生活情報ブロックは Task 15 で `<LivingSections>` に差し替える。いまは `specialties` のみ条件付き描画する。

```tsx
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ClimateCalendar } from "@/components/city/climate-calendar"
import { getCity, listCities } from "@/lib/cities"
import { getClimate } from "@/lib/cities/climate"
import { describeWeatherCode } from "@/lib/cities/weather-codes"
import { fetchCityWeather } from "@/lib/cities/weather"

export function generateStaticParams() {
  return listCities().map((city) => ({ slug: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getCity(slug)
  if (!city) return { title: "都市が見つかりません | IndoBiz Japan" }
  return {
    title: `${city.jp}（${city.name}）の都市データ | IndoBiz Japan`,
    description: city.note,
  }
}

/** 天気だけが動的。失敗時は何も描画しない（フェイルオープン）。 */
async function CurrentWeather({ slug }: { slug: string }) {
  const weather = await fetchCityWeather()
  const current = weather?.[slug]
  if (!current) return null
  return (
    <span className="font-mono text-xs text-muted-foreground">
      現在 {current.tempC}°C・{describeWeatherCode(current.weatherCode)}
    </span>
  )
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const city = getCity(slug)
  if (!city) notFound()

  const climate = getClimate(city.slug)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/city" className="font-mono text-xs text-muted-foreground hover:text-accent">
        ← 都市一覧
      </Link>

      <header className="mt-4">
        {city.imageUrl && (
          <div className="relative mb-4 aspect-[16/7] overflow-hidden rounded-md bg-muted">
            <Image src={city.imageUrl} alt={`${city.name} cityscape`} fill className="object-cover" sizes="768px" priority />
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-serif text-3xl font-bold">{city.jp}</h1>
          <span className="font-mono text-sm text-muted-foreground">{city.name}</span>
          <Suspense fallback={null}>
            <CurrentWeather slug={city.slug} />
          </Suspense>
        </div>
        <p className="mt-3 leading-relaxed text-muted-foreground">{city.note}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
          <div className="rounded bg-muted p-3">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">人口</dt>
            <dd className="font-bold">{city.pop}</dd>
          </div>
          <div className="rounded bg-muted p-3">
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">GDP</dt>
            <dd className="font-bold">{city.gdp}</dd>
          </div>
        </dl>
      </header>

      {climate && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-bold">気候と渡航適期</h2>
          <ClimateCalendar climate={climate} bestMonths={city.bestMonths} avoidMonths={city.avoidMonths} />
        </section>
      )}

      {city.specialties && city.specialties.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-bold">名物</h2>
          <ul className="space-y-3">
            {city.specialties.map((specialty) => (
              <li key={specialty.jp} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-serif font-bold">{specialty.jp}</h3>
                  <span className="bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">{specialty.kind}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{specialty.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {city.living && (
        <p className="mt-10 rounded-md border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          生活情報は{city.living.verifiedAt.replace("-", "年")}月時点で確認したものです。渡航前に最新情報をご確認ください。
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 4: 都市一覧ページを書く**

`app/city/page.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"

import { listCities } from "@/lib/cities"

export const metadata = {
  title: "都市データ | IndoBiz Japan",
  description: "インド主要9都市の気候・名物・生活情報。出張・駐在の準備に。",
}

export default function CityIndexPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold">都市データ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        インド主要9都市の気候・名物・生活情報。出張・駐在の準備に。
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listCities().map((city) => (
          <li key={city.slug}>
            <Link
              href={`/city/${city.slug}`}
              className="block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-accent"
            >
              {city.imageUrl && (
                <div className="relative aspect-[16/10] bg-muted">
                  <Image src={city.imageUrl} alt={`${city.name} cityscape`} fill className="object-cover" sizes="(min-width: 1024px) 320px, 50vw" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-lg font-bold">{city.jp}</h2>
                  <span className="font-mono text-[10px] text-muted-foreground">{city.name}</span>
                </div>
                <p className="mt-1 font-mono text-[10px] tracking-wider text-accent">{city.tag}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 5: ブラウザで確認**

Run: `npm run dev` を起動し、`/city` と `/city/mumbai` を開く
Expected: 一覧に9都市。ムンバイ詳細に画像・人口・GDP・現在天気・12ヶ月の気候カレンダーが出る。7月の降水量バーが目立ち、モンスーンが読み取れる。名物セクションは未表示。

- [ ] **Step 6: 型チェック**

Run: `./node_modules/.bin/tsc --noEmit`
Expected: エラーなし

- [ ] **Step 7: コミット**

```bash
git add app/city components/city
git commit -m "feat: add /city index and city detail pages with climate calendar"
```

---

### Task 6: ムンバイの名物・生活情報（第1パス＋第2パス）

「都市コンテンツ執筆プロトコル」に従う。この Task は以降8都市の**手本**となるため、丁寧に行うこと。

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "mumbai"` のエントリ）
- Create: `docs/city-fact-check-2026-07.md`

**Interfaces:**
- Consumes: `CitySpecialty`, `CityLiving` 型
- Produces: `CITIES[0].specialties`, `CITIES[0].living`, `CITIES[0].bestMonths`, `CITIES[0].avoidMonths`

- [ ] **Step 1: 渡航適期を climate.ts から判断して記入**

`lib/cities/climate.ts` のムンバイの12ヶ月を読み、降水量と気温から `bestMonths` / `avoidMonths` を決めて `data.ts` に追記する。**記憶からではなく生成された数値を見て決めること。** モンスーン月（降水量が突出する月）が `avoidMonths`、乾季で気温が穏やかな月が `bestMonths`。両者は重複させない。

- [ ] **Step 2: 第1パス — WebSearch で裏を取りながら執筆**

以下を `WebSearch` で調べ、`lib/cities/data.ts` のムンバイに `specialties` と `living` を追記する。

調べる項目と初回クエリ:
- `Mumbai expat neighborhoods Bandra Powai rent 2026`
- `Mumbai hospitals international patients Japanese speaking`
- `ムンバイ 日本人学校 日本人会`
- `Mumbai airport to city transport 2026` / `成田 ムンバイ 直行便`

書式:

```ts
    bestMonths: [11, 12, 1, 2],
    avoidMonths: [6, 7, 8, 9],
    specialties: [
      { jp: "ヴァダパヴ", kind: "料理", note: "..." },
    ],
    living: {
      housing: {
        areas: ["Bandra West", "Powai", "Lower Parel"],
        rents: [{ layout: "2BHK（駐在員向け）", minUsd: 0, maxUsd: 0 }],
        note: "...",
      },
      safetyHealth: {
        safetyNote: "...",
        hospitals: [{ name: "...", note: "..." }],
        healthNote: "...",
      },
      transport: {
        fromAirport: "...",
        inCity: "...",
        directFlightFromJapan: "...",
        commuteNote: "...",
      },
      japaneseCommunity: {
        association: "...",
        schools: ["..."],
        groceries: ["..."],
        corporateNote: "...",
      },
      verifiedAt: "2026-07",
    },
```

- [ ] **Step 3: 第2パス — 独立検証**

**Step 2 の検索結果を見返さずに**、書いた固有名詞・数値を1件ずつ別クエリで再検索する。

- 病院名 → その名前で単独検索し、ムンバイに実在するか確認
- 日本人学校・日本人会 → 名称で単独検索し、実在し閉鎖されていないか確認
- 家賃レンジ → 別の情報源で桁が一致するか確認
- 直行便 → 現在も就航しているか確認
- エリア名 → 実在する地名か確認

判定: 確認できた→残す / 矛盾した→修正または削除 / **確認できなかった→削除**。

削除の結果 `hospitals` が空配列になったら、`safetyHealth` から `hospitals` ごと落とすのではなく空配列のまま残してよい（UI 側で空配列は描画しない）。`housing` 全体が確認できなければ `housing` を省く。

- [ ] **Step 4: 検証ログを作成**

`docs/city-fact-check-2026-07.md` を新規作成:

```markdown
# 都市生活情報 ファクトチェックログ（2026年7月）

`lib/cities/data.ts` の `living` に書かれた固有名詞・数値の独立検証記録。
執筆（第1パス）とは別クエリで再検索し、確認できなかった項目は削除した。

判定: ✅ 確認 / ⚠️ 修正 / ❌ 削除

| 都市 | 項目 | 記述 | 判定 | 出典 |
|---|---|---|---|---|
| ムンバイ | 病院 | （実際に書いた内容） | ✅ | https://... |
```

以降の都市タスクはこの表に行を追加する。

- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`
Expected: 両方ともエラーなし

`/city/mumbai` をブラウザで開き、名物・生活情報・時点注記が表示されることを確認。

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Mumbai"
```

---

### Task 7: デリー首都圏の名物・生活情報

プロトコルの5ステップを `slug: "delhi-ncr"` について実施する。`docs/city-fact-check-2026-07.md` は新規作成せず**追記**する。

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "delhi-ncr"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のデリーの数値を読み `bestMonths` / `avoidMonths` を決める**（記憶からではなく生成値から）
- [ ] **Step 2: 第1パス — `WebSearch` で裏取りしつつ執筆。初回クエリ: `Delhi expat neighborhoods rent 2026` / `Delhi hospitals international patients` / `デリー 日本人学校 日本人会` / `成田 デリー 直行便`。大気汚染（AQI）が実務上の重要事項なので `healthNote` に必ず含める（数値を書くなら裏を取る）**
- [ ] **Step 3: 第2パス — 別クエリで病院名・学校名・家賃・直行便・エリア名を独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: `docs/city-fact-check-2026-07.md` の表に行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`
Expected: エラーなし

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Delhi NCR"
```

---

### Task 8: グルガオンの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "gurgaon"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のグルガオンの数値を読み `bestMonths` / `avoidMonths` を決める**
- [ ] **Step 2: 第1パス — 初回クエリ: `Gurgaon expat housing DLF Golf Course Road rent` / `Gurgaon hospitals Medanta Fortis` / `グルガオン 日本人 駐在` / `Gurgaon Delhi airport access`。デリー首都圏の一部だが日系 GCC の集積地として独立した実務価値がある点を `corporateNote` に書く**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Gurgaon"
```

---

### Task 9: ベンガルールの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "bengaluru"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のベンガルールの数値を読み `bestMonths` / `avoidMonths` を決める。年間を通じて穏やかで「避ける月」が存在しない可能性が高い。その場合 `avoidMonths: []` とし、無理に月を選ばない**
- [ ] **Step 2: 第1パス — 初回クエリ: `Bengaluru expat neighborhoods Indiranagar Whitefield rent` / `Bangalore hospitals international patients` / `バンガロール 日本人学校 日本人会` / `成田 ベンガルール 直行便`**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Bengaluru"
```

---

### Task 10: チェンナイの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "chennai"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のチェンナイの数値を読み `bestMonths` / `avoidMonths` を決める。北東モンスーン（10〜12月）で降水が集中し、他都市と季節がずれる点に注意**
- [ ] **Step 2: 第1パス — 初回クエリ: `Chennai expat neighborhoods rent` / `Chennai hospitals Apollo international` / `チェンナイ 日本人学校 日本人会` / `Chennai Japanese companies automotive`。日系自動車の集積地であり日本人コミュニティが厚い点を `corporateNote` に書く**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Chennai"
```

---

### Task 11: プネの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "pune"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のプネの数値を読み `bestMonths` / `avoidMonths` を決める**
- [ ] **Step 2: 第1パス — 初回クエリ: `Pune expat neighborhoods Koregaon Park rent` / `Pune hospitals international patients` / `プネ 日本人` / `Pune Mumbai airport access`。日本からの直行便がない可能性が高い。無ければ「無い」と書く（ムンバイ経由の実態を `directFlightFromJapan` に記す）**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Pune"
```

---

### Task 12: ハイデラバードの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "hyderabad"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のハイデラバードの数値を読み `bestMonths` / `avoidMonths` を決める**
- [ ] **Step 2: 第1パス — 初回クエリ: `Hyderabad expat neighborhoods Gachibowli Banjara Hills rent` / `Hyderabad hospitals international patients` / `ハイデラバード 日本人` / `Hyderabad airport access`。ビリヤニが名物として著名だが、`WebSearch` で裏を取ってから書く**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Hyderabad"
```

---

### Task 13: アフマダーバードの名物・生活情報

情報が乏しく削除が多くなる見込みの都市。**密度を揃えるために推測で埋めないこと。**

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "ahmedabad"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のアフマダーバードの数値を読み `bestMonths` / `avoidMonths` を決める。5月前後の酷暑が `avoidMonths` に入る可能性が高いが、生成値で確認する**
- [ ] **Step 2: 第1パス — 初回クエリ: `Ahmedabad expat housing rent` / `Ahmedabad hospitals international patients` / `アフマダーバード 日本人` / `Ahmedabad airport access`。グジャラート州は禁酒州である点が駐在実務上重要なので、裏を取った上で `safetyNote` か `healthNote` に含める**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除。`japaneseCommunity` の学校が確認できなければ `schools: []` とする**
- [ ] **Step 4: 検証ログに行を追加（❌削除の行も必ず記録する）**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Ahmedabad"
```

---

### Task 14: コルカタの名物・生活情報

**Files:**
- Modify: `lib/cities/data.ts`（`slug: "kolkata"`）
- Modify: `docs/city-fact-check-2026-07.md`

- [ ] **Step 1: `climate.ts` のコルカタの数値を読み `bestMonths` / `avoidMonths` を決める**
- [ ] **Step 2: 第1パス — 初回クエリ: `Kolkata expat neighborhoods Salt Lake rent` / `Kolkata hospitals international patients` / `コルカタ 日本人 領事館` / `Kolkata airport access`**
- [ ] **Step 3: 第2パス — 別クエリで独立再検証。確認できなかった項目は削除**
- [ ] **Step 4: 検証ログに行を追加**
- [ ] **Step 5: 検証してコミット**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`

```bash
git add lib/cities/data.ts docs/city-fact-check-2026-07.md
git commit -m "content: add verified specialties and living info for Kolkata"
```

---

### Task 15: 生活情報の描画と完全性ゲート

全都市のデータが揃ったので、生活情報 UI を作り、完全性テストを掛ける。

**Files:**
- Create: `components/city/living-sections.tsx`
- Modify: `app/city/[slug]/page.tsx`
- Modify: `lib/cities/data.test.ts`

**Interfaces:**
- Consumes: `CityLiving`
- Produces: `<LivingSections living={city.living} />`

- [ ] **Step 1: 完全性ゲートのテストを書く（失敗するはず）**

`lib/cities/data.test.ts` に追記:

Task 2 と同じ理由で、`undefined` の除去には `assert.ok` ではなく `if (!x) throw` を使う。

```ts
test("全都市が specialties と living を持つ", () => {
  for (const city of CITIES) {
    assert.ok(city.specialties?.length, `${city.slug}: specialties`)
    const living = city.living
    if (!living) throw new Error(`${city.slug}: living なし`)
    assert.equal(living.verifiedAt, "2026-07", `${city.slug}: verifiedAt`)
  }
})

test("全都市が bestMonths / avoidMonths を持ち 1-12 で重複しない", () => {
  for (const city of CITIES) {
    const { bestMonths, avoidMonths } = city
    if (!bestMonths?.length) throw new Error(`${city.slug}: bestMonths なし`)
    if (!avoidMonths) throw new Error(`${city.slug}: avoidMonths なし`)
    for (const month of [...bestMonths, ...avoidMonths]) {
      assert.ok(month >= 1 && month <= 12, `${city.slug}: ${month} が範囲外`)
    }
    const overlap = bestMonths.filter((month) => avoidMonths.includes(month))
    assert.deepEqual(overlap, [], `${city.slug}: bestMonths と avoidMonths が重複`)
  }
})

test("家賃レンジは minUsd <= maxUsd", () => {
  for (const city of CITIES) {
    for (const rent of city.living?.housing?.rents ?? []) {
      assert.ok(rent.minUsd <= rent.maxUsd, `${city.slug}/${rent.layout}`)
      assert.ok(rent.minUsd > 0, `${city.slug}/${rent.layout}: minUsd が 0 以下`)
    }
  }
})
```

- [ ] **Step 2: テストを実行**

Run: `npm run test:cities`
Expected: PASS（Task 6〜14 で全都市が埋まっているため）。**FAIL した都市があれば、その都市のタスクが未完了である。推測で埋めず、当該タスクに戻ること。**

- [ ] **Step 3: 生活情報コンポーネントを書く**

`components/city/living-sections.tsx`。**任意フィールドはすべて条件付き描画**する。ファクトチェックで落ちた項目が「空欄」として表示されてはならない。

```tsx
import type { CityLiving } from "@/lib/cities"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <h3 className="mb-3 border-b border-border pb-2 font-serif text-base font-bold">{title}</h3>
      {children}
    </section>
  )
}

export function LivingSections({ living }: { living: CityLiving }) {
  const { housing, safetyHealth, transport, japaneseCommunity } = living

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {housing && (
        <Block title="住居・家賃相場">
          <p className="text-xs text-muted-foreground">主な駐在エリア</p>
          <p className="mt-1 text-sm">{housing.areas.join("・")}</p>
          {housing.rents.length > 0 && (
            <dl className="mt-3 space-y-1 font-mono text-xs">
              {housing.rents.map((rent) => (
                <div key={rent.layout} className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{rent.layout}</dt>
                  <dd className="tabular-nums">${rent.minUsd.toLocaleString()}〜${rent.maxUsd.toLocaleString()}/月</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{housing.note}</p>
        </Block>
      )}

      {safetyHealth && (
        <Block title="治安・医療">
          <p className="text-sm leading-relaxed text-muted-foreground">{safetyHealth.safetyNote}</p>
          {safetyHealth.hospitals.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {safetyHealth.hospitals.map((hospital) => (
                <li key={hospital.name} className="text-sm">
                  <span className="font-bold">{hospital.name}</span>
                  <span className="text-muted-foreground"> — {hospital.note}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{safetyHealth.healthNote}</p>
        </Block>
      )}

      {transport && (
        <Block title="交通・空港アクセス">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">空港から市内</dt>
              <dd className="leading-relaxed">{transport.fromAirport}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">市内移動</dt>
              <dd className="leading-relaxed">{transport.inCity}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">日本からの直行便</dt>
              <dd className="leading-relaxed">{transport.directFlightFromJapan}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">通勤</dt>
              <dd className="leading-relaxed">{transport.commuteNote}</dd>
            </div>
          </dl>
        </Block>
      )}

      {japaneseCommunity && (
        <Block title="日本人コミュニティ">
          {japaneseCommunity.association && (
            <p className="text-sm">
              <span className="text-xs text-muted-foreground">日本人会</span>
              <br />
              {japaneseCommunity.association}
            </p>
          )}
          {japaneseCommunity.schools.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="text-xs text-muted-foreground">学校</span>
              <br />
              {japaneseCommunity.schools.join("・")}
            </p>
          )}
          {japaneseCommunity.groceries.length > 0 && (
            <p className="mt-2 text-sm">
              <span className="text-xs text-muted-foreground">日本食材</span>
              <br />
              {japaneseCommunity.groceries.join("・")}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{japaneseCommunity.corporateNote}</p>
        </Block>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 都市ページに組み込む**

`app/city/[slug]/page.tsx` の import に追加:

```tsx
import { LivingSections } from "@/components/city/living-sections"
```

`{city.living && (` で始まる時点注記の段落の**直前**に、次のセクションを挿入する:

```tsx
      {city.living && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-bold">生活情報</h2>
          <LivingSections living={city.living} />
        </section>
      )}
```

- [ ] **Step 5: ブラウザで全都市を確認**

Run: `npm run dev` を起動し、9都市すべての `/city/<slug>` を開く
Expected: 生活情報4ブロックが描画される。ファクトチェックで落とした項目のブロックは**そもそも表示されない**（空欄や「—」が出ていないこと）。都市によってブロック数が違うのは想定通り。

- [ ] **Step 6: 検証**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`
Expected: 両方エラーなし

- [ ] **Step 7: コミット**

```bash
git add components/city/living-sections.tsx app/city/\[slug\]/page.tsx lib/cities/data.test.ts
git commit -m "feat: render living info sections and enforce city data completeness"
```

---

### Task 16: サイドバーカードに天気と都市ページリンクを追加

既存カードの見た目を崩さず、天気1行とリンク1本を足す。

**Files:**
- Modify: `components/sidebar-widgets.tsx`（`CitySpotlightWidget`）

**Interfaces:**
- Consumes: `GET /api/city-weather`, `describeWeatherCode()`

- [ ] **Step 1: 天気取得フックを `CitySpotlightWidget` に追加**

`components/sidebar-widgets.tsx` の import に追加:

```ts
import { describeWeatherCode } from "@/lib/cities/weather-codes"
import type { CityWeatherMap } from "@/lib/cities/weather"
```

`CitySpotlightWidget` の `const [index, setIndex] = useState(0)` の直後に追加:

```ts
  const [weather, setWeather] = useState<CityWeatherMap | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/city-weather")
      .then((res) => res.json())
      .then((payload: { weather?: CityWeatherMap }) => {
        if (!cancelled && payload.weather) setWeather(payload.weather)
      })
      .catch(() => {
        // フェイルオープン: 天気行を出さないだけ
      })
    return () => {
      cancelled = true
    }
  }, [])
```

（`useEffect` は既に `react` から import 済み。`Link` も import 済み。）

- [ ] **Step 2: 天気行を描画**

`<h4 className="font-serif text-xl font-bold">{city.jp}</h4>` を含む `flex items-baseline justify-between` の div の**直後**に挿入:

```tsx
      {weather?.[city.slug] && (
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          現在 {weather[city.slug].tempC}°C・{describeWeatherCode(weather[city.slug].weatherCode)}
        </p>
      )}
```

- [ ] **Step 3: 都市ページへのリンクを追加**

`CitySpotlightWidget` 末尾の `<div className="mt-3 flex items-center justify-end gap-1.5">` から、その閉じ `</div>` までの**ブロック全体**を、以下で置き換える（リンクを左、前後ボタンを右に配置し、ボタンを1段ネストする）:

```tsx
      <div className="mt-3 flex items-center justify-between gap-1.5">
        <Link
          href={`/city/${city.slug}`}
          className="font-mono text-[10px] tracking-wider text-accent hover:underline"
        >
          都市データを見る →
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={!canGoBack}
            aria-label="前の都市"
            className="grid size-7 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(CITIES.length - 1, current + 1))}
            disabled={!canGoForward}
            aria-label="次の都市"
            className="grid size-7 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
```

- [ ] **Step 4: ブラウザで確認**

Run: `npm run dev` を起動しトップページを開く
Expected: サイドバーの都市カードに「現在 29°C・霧雨」の行と「都市データを見る →」リンクが出る。前後ボタンで都市を切り替えると天気も切り替わる。リンクは該当都市ページへ飛ぶ。カードの既存レイアウトは崩れていない。

- [ ] **Step 5: 天気 API 障害時の挙動を確認**

`lib/cities/weather.ts` の `FORECAST_URL` を一時的に `"https://invalid.example/v1/forecast"` に書き換え、トップページと `/city/mumbai` を開く。

Expected: どちらも天気行だけが消え、他は正常に表示される。エラー画面は出ない。確認後、**必ず URL を元に戻す**。

- [ ] **Step 6: 検証**

Run: `./node_modules/.bin/tsc --noEmit && npm run test:cities`
Expected: エラーなし。`git diff lib/cities/weather.ts` が空であること（Step 5 の変更が残っていないこと）。

- [ ] **Step 7: コミット**

```bash
git add components/sidebar-widgets.tsx
git commit -m "feat: show current weather and city page link in sidebar spotlight"
```

---

### Task 17: ドキュメント更新

`CLAUDE.md` は新規参加者が最初に読むファイルであり、`lib/cities/` の存在と「生成物を手で編集するな」「事実は裏取りせよ」を伝える必要がある。

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: `CLAUDE.md` の "UI Conventions" 節の直前に節を追加**

```markdown
## 都市データ (`lib/cities/`)

インド主要9都市の静的データ。Supabase には保存しない（`lib/authors.ts` と同じ静的ロスター方式）。

- `data.ts` — 唯一の真実。名物・生活情報を含む。
- `climate.ts` — **生成物。手で編集しない。** `node --experimental-strip-types scripts/fetch-city-climate.mjs` で Open-Meteo Archive API（2015-2024年の実測）から再生成する。観測値のみを持ち、渡航適期などの判断は含まない。
- `weather.ts` — 現在天気。RSC は直接呼び、クライアントコンポーネントは `GET /api/city-weather` 経由。**フェイルオープン**: 取得失敗時は天気行が消えるだけで、ページは落ちない。

**生活情報に事実を書くときは必ず裏を取ること。** 病院名・学校名・家賃・直行便の有無は、`WebSearch` で確認してから書き、確認できなければ推測で埋めずその項目を落とす。既存の記述の出典は `docs/city-fact-check-2026-07.md` に記録されている。都市によって情報密度が不揃いなのはこの方針の結果であり、揃えるために推測を足してはならない。

`specialties` / `living` およびその内側のフィールドが任意型なのも同じ理由による。UI（`components/city/living-sections.tsx`）は存在するブロックだけを描画する。

検証: `npm run test:cities`
```

- [ ] **Step 2: API ルート表に追加**

`CLAUDE.md` の API Routes 表の `GET /api/market/snapshot` 行の直後に追加:

```markdown
| `GET /api/city-weather` | — | 全都市の現在天気（Open-Meteo、30分キャッシュ、フェイルオープン） |
```

- [ ] **Step 3: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: document lib/cities and city-weather route in CLAUDE.md"
```

---

## 完了条件

- `./node_modules/.bin/tsc --noEmit` がエラーなし
- `npm run test:cities` が全パス（完全性ゲート含む）
- `/city` に9都市、`/city/<slug>` 9本すべてが表示される
- サイドバーカードに天気とリンクが出る
- 天気 API を落としてもページが落ちない
- `docs/city-fact-check-2026-07.md` に全都市の検証記録がある
- `git diff main --stat` に `lib/cities/climate.ts` の手編集が含まれない
