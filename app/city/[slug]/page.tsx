import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ClimateCalendar } from "@/components/city/climate-calendar"
import { LivingSections } from "@/components/city/living-sections"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
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
    <div className="min-h-screen bg-background">
      <SiteHeader />
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

      {city.japaneseCompanies && city.japaneseCompanies.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-bold">日本からの主な進出企業</h2>
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {city.japaneseCompanies.map((company) => (
              <li key={company.name} className="p-4">
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif font-bold text-foreground underline-offset-4 hover:text-accent hover:underline"
                >
                  {company.name}
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground">↗</span>
                </a>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{company.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

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
              <li key={specialty.jp} className="overflow-hidden rounded-md border border-border bg-card">
                <div className="flex">
                  {specialty.imageUrl && (
                    <div className="relative w-28 shrink-0 self-stretch bg-muted sm:w-36">
                      <Image
                        src={specialty.imageUrl}
                        alt={specialty.jp}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 p-4">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-serif font-bold">{specialty.jp}</h3>
                      <span className="bg-foreground px-1.5 py-0.5 font-mono text-[10px] text-background">{specialty.kind}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{specialty.note}</p>
                    {specialty.imageCredit && (
                      <p className="mt-2 font-mono text-[9px] tracking-wider text-muted-foreground/70">
                        Photo: {specialty.imageCredit}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {city.living && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-bold">生活情報</h2>
          <LivingSections living={city.living} />
        </section>
      )}

      {city.living && (
        <p className="mt-10 rounded-md border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
          生活情報は{city.living.verifiedAt.replace("-", "年")}月時点で確認したものです。渡航前に最新情報をご確認ください。
        </p>
      )}
      </main>
      <SiteFooter />
    </div>
  )
}
