import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"

import { IndiaMap } from "@/components/city/india-map"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { listCities } from "@/lib/cities"
import { fetchCityWeather } from "@/lib/cities/weather"
import { weatherCodeEmoji } from "@/lib/cities/weather-codes"

export const metadata = {
  title: "都市データ | IndoBiz Japan",
  description: "インド主要9都市の気候・名物・生活情報。出張・駐在の準備に。",
}

/**
 * カード用の今日の天気バッジ。9カードぶん呼ばれるが、fetchCityWeather() は
 * 同一URL + revalidate なので Next の fetch キャッシュで1リクエストにまとまる。
 * 失敗時は何も描画しない（フェイルオープン）。
 */
async function CardWeather({ slug }: { slug: string }) {
  const weather = await fetchCityWeather()
  const current = weather?.[slug]
  if (!current) return null
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1">
      <span className="text-base leading-none">{weatherCodeEmoji(current.weatherCode)}</span>
      <span className="font-mono text-xs font-bold leading-none">
        {typeof current.tempMaxC === "number" && typeof current.tempMinC === "number" ? (
          <>
            <span className="text-red-600 dark:text-red-400">{current.tempMaxC}°</span>
            <span className="mx-0.5 text-muted-foreground">/</span>
            <span className="text-blue-600 dark:text-blue-400">{current.tempMinC}°</span>
          </>
        ) : (
          <span>{current.tempC}°C</span>
        )}
      </span>
    </span>
  )
}

export default function CityIndexPage() {
  const cities = listCities()
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold">都市データ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        インド主要9都市の気候・名物・生活情報。出張・駐在の準備に。
      </p>

      <section className="mt-8 rounded-md border border-border bg-card p-4 sm:p-6">
        <IndiaMap cities={cities} />
        <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
          地図の都市名をクリックすると各都市のページへ移動します
        </p>
      </section>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, index) => (
          <li key={city.slug}>
            <Link
              href={`/city/${city.slug}`}
              className="block overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-accent"
            >
              {city.imageUrl && (
                <div className="relative aspect-[16/10] bg-muted">
                  <Image
                    src={city.imageUrl}
                    alt={`${city.name} cityscape`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 320px, 50vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="min-w-0 font-serif text-lg font-bold">{city.jp}</h2>
                  <Suspense fallback={null}>
                    <CardWeather slug={city.slug} />
                  </Suspense>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="font-mono text-[10px] tracking-wider text-accent">{city.tag}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">{city.name}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      </main>
      <SiteFooter />
    </div>
  )
}
