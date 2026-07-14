# 都市データ拡張: インド地図・カード天気・進出企業 — 設計

日付: 2026-07-14 / 対象: `/city`（一覧）・`/city/[slug]`（詳細）

ユーザー確認済みの決定:
1. 地図 = インタラクティブSVG地図（都市一覧ページ上部、マーカークリックで都市ページへ）
2. 進出企業 = 都市詳細ページに掲載（一覧カードには載せない — リンク入れ子回避）
3. 企業データ = Claude がWeb検索で裏取りし各都市3〜5社。確認できた企業のみ掲載、出典は docs に記録

## 1. インド地図（/city 上部）

- `scripts/generate-india-map.mjs`（新規）: インドの GeoJSON 輪郭（Natural Earth 由来のパブリックデータ）を取得し、等長方形図法（経度方向は中央緯度の cos で補正）で SVG パス文字列へ変換、`lib/cities/india-map.ts` を生成する。**生成物・手で編集しない**（`climate.ts` と同じ方式）。
- `lib/cities/india-map.ts`（生成物）: `INDIA_PATH`（SVGパス）、`MAP_WIDTH/HEIGHT`、`projectToMap(lat, lon)`（都市座標→SVG座標。生成時と同一の射影定数を埋め込む）。
- `components/city/india-map.tsx`（新規・サーバーコンポーネント）: `<svg>` に輪郭パス + 9都市のマーカー。各マーカーは SVG `<a href="/city/<slug>">` で都市ページへ。都市名ラベルは重なり（Delhi NCR/Gurgaon、Mumbai/Pune）を避けるため都市ごとにアンカー方向を持つ。ホバーでマーカー強調（CSSのみ、クライアントJSなし）。
- 国境の表現は Natural Earth の実効支配ベース。凡例等で領有権の主張はしない。

## 2. カード天気（/city 一覧カード）

- `lib/cities/weather.ts`: Open-Meteo リクエストに `daily=temperature_2m_max,temperature_2m_min&forecast_days=1` を追加。`CityWeather` に `tempMinC?/tempMaxC?` を追加（欠損しても現在気温のみで動く後方互換）。フェイルオープン方針は不変。
- `lib/cities/weather-codes.ts`: `weatherCodeEmoji(code)` を追加（WMOコード→☀️/⛅/☁️/🌧️/⛈️/🌫️/❄️）。
- `app/city/page.tsx`: カード内の都市名行の右側に天気バッジ（絵文字 + 最高/最低気温、最高=暖色・最低=寒色）。カードごとの async コンポーネント + `<Suspense fallback={null}>`。9回の `fetchCityWeather()` は Next の fetch キャッシュ（同一URL・revalidate 1800）で1リクエストにデデュープされる。取得失敗時はバッジが消えるだけ。

## 3. 日本からの主な進出企業（/city/[slug]）

- `lib/cities/types.ts`: `City` に `japaneseCompanies?: { name: string; url: string; note?: string }[]` を追加（任意 — 裏取りできない都市は載せない方針の継続）。
- `lib/cities/data.ts`: 各都市に WebSearch で確認済みの日系企業 3〜5社（社名・公式URL・拠点の一行メモ）。
- `app/city/[slug]/page.tsx`: ヘッダー（特徴・産業・人口/GDP）の直下に「日本からの主な進出企業」セクション。社名は公式サイトへの外部リンク（`target="_blank" rel="noopener noreferrer"`）。
- 出典は `docs/city-fact-check-2026-07.md` に追記。

## 検証

`./node_modules/.bin/tsc --noEmit`、`npm run test:cities`、dev サーバーで `/city` と代表都市ページの目視確認。
