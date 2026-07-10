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
