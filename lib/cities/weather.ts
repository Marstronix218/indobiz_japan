import { CITIES } from "./data"

export type CityWeather = {
  tempC: number
  weatherCode: number
  /** 当日の予想最高/最低気温。daily 応答が欠けた都市では undefined */
  tempMaxC?: number
  tempMinC?: number
}
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
    `&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!res.ok) return null

    const payload: unknown = await res.json()
    if (!Array.isArray(payload) || payload.length !== CITIES.length) return null

    const map: CityWeatherMap = {}
    payload.forEach((entry, index) => {
      // null/undefined 要素へのプロパティ読み出しは throw する。catch はされるが、
      // その1都市のために残る8都市の正常な天気まで捨ててしまう。ここで飛ばす。
      if (entry === null || typeof entry !== "object") return
      const current = (entry as { current?: { temperature_2m?: number; weather_code?: number } })
        .current
      if (typeof current?.temperature_2m !== "number") return
      if (typeof current?.weather_code !== "number") return
      const weather: CityWeather = {
        tempC: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
      }
      // 最高/最低は「あれば足す」。daily が欠けても現在天気は返す。
      const daily = (entry as { daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] } })
        .daily
      if (typeof daily?.temperature_2m_max?.[0] === "number") {
        weather.tempMaxC = Math.round(daily.temperature_2m_max[0])
      }
      if (typeof daily?.temperature_2m_min?.[0] === "number") {
        weather.tempMinC = Math.round(daily.temperature_2m_min[0])
      }
      map[CITIES[index].slug] = weather
    })

    return Object.keys(map).length > 0 ? map : null
  } catch {
    return null
  }
}
