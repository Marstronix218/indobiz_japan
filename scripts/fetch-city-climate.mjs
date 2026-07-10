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

  let res
  for (let attempt = 1; attempt <= 5; attempt++) {
    res = await fetch(url)
    if (res.ok) break
    if (res.status === 429 && attempt < 5) {
      const backoffMs = 5000 * attempt
      process.stdout.write(`(429, retry ${attempt} in ${backoffMs}ms) `)
      await sleep(backoffMs)
      continue
    }
    throw new Error(`${city.slug}: HTTP ${res.status}`)
  }
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
  await sleep(3000) // レート制限回避
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
