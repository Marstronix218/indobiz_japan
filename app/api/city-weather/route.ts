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
