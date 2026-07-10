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
