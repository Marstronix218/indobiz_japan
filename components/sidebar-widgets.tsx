"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Feather,
  LineChart,
  Mail,
  MapPin,
} from "lucide-react"
import {
  articleDisplayDate,
  formatArticleShortDate,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import type { MarketSnapshotLive } from "@/lib/market-data"
import { usePublicArticles } from "@/lib/article-store"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { CITIES } from "@/lib/cities"
import { describeWeatherCode } from "@/lib/cities/weather-codes"
import type { CityWeatherMap } from "@/lib/cities/weather"
import { addJapanesePhraseBreaks } from "@/lib/japanese-line-breaks"

const TONE_TO_STRIPE: Record<ImagePlaceholderTone, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function RailHead({
  label,
  en,
  icon,
}: {
  label: string
  en: string
  icon: React.ReactNode
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
      <div className="flex items-center gap-1.5">
        <span className="text-accent">{icon}</span>
        <h3 className="font-serif text-[13px] font-bold">{label}</h3>
      </div>
      <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
        {en}
      </span>
    </div>
  )
}

export function TrendingWidget() {
  const allArticles = usePublicArticles()
  const trending = allArticles.filter((a) => a.category !== "column").slice(0, 5)

  if (trending.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead
        label="アクセスランキング"
        en="RANKING"
        icon={<BarChart3 className="size-4" />}
      />
      <ul className="space-y-3.5">
        {trending.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <span
              className={
                "w-7 shrink-0 font-serif text-2xl font-black leading-none " +
                (index < 3 ? "text-accent" : "text-border")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/article/${article.id}`}
                className="text-auto-phrase line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
              >
                {addJapanesePhraseBreaks(article.title)}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {formatArticleShortDate(articleDisplayDate(article))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

type IndicatorRow = {
  label: string
  sub: string
  value: string
  change: string
  up: boolean
}

function rowsFromLive(snapshot: MarketSnapshotLive): IndicatorRow[] {
  const wanted = ["INR/JPY", "USD/INR", "Nifty 50", "Sensex", "Brent"]
  const map = new Map(snapshot.items.map((q) => [q.label, q]))
  return wanted
    .map((w) => map.get(w))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      label: q.label,
      sub: q.sub,
      value: q.value,
      change: q.change,
      up: q.direction === "up",
    }))
}

function formatLiveAsOf(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}

export function MarketIndicatorWidget() {
  const articles = usePublicArticles()
  const fallbackArticle = articles.find((a) => a.marketSnapshot)
  const [snapshot, setSnapshot] = useState<MarketSnapshotLive | null>(null)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/market/snapshot", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as MarketSnapshotLive
        if (!cancelled) {
          setSnapshot(data)
          setErrored(false)
        }
      } catch {
        if (!cancelled) setErrored(true)
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  let rows: IndicatorRow[] = []
  let asOfLabel = ""
  let href: string | null = null

  if (snapshot) {
    rows = rowsFromLive(snapshot)
    asOfLabel = `ライブ · ${formatLiveAsOf(snapshot.asOf)}`
  } else if (fallbackArticle?.marketSnapshot) {
    const m = fallbackArticle.marketSnapshot
    rows = [
      { ...m.fx, sub: "₹/¥", up: m.fx.change.startsWith("+") },
      { ...m.equities, sub: "指数", up: m.equities.change.startsWith("+") },
      { ...m.rates, sub: "利回り%", up: m.rates.change.startsWith("+") },
      { ...m.oil, sub: "USD/bbl", up: m.oil.change.startsWith("+") },
    ]
    asOfLabel = `スナップショット · ${m.fx.asOf}`
    href = `/article/${fallbackArticle.id}`
  } else if (errored) {
    return null
  } else {
    // initial loading: render empty card with placeholder
    rows = [
      { label: "INR/JPY", sub: "₹/¥", value: "—", change: "—", up: false },
      { label: "USD/INR", sub: "$/₹", value: "—", change: "—", up: false },
      { label: "Nifty 50", sub: "指数", value: "—", change: "—", up: false },
      { label: "Brent", sub: "USD/bbl", value: "—", change: "—", up: false },
    ]
    asOfLabel = "ロード中…"
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <Link
        href={href}
        className="block rounded-md border border-border bg-card p-5 transition-shadow hover:shadow-md"
      >
        {children}
      </Link>
    ) : (
      <div className="block rounded-md border border-border bg-card p-5">
        {children}
      </div>
    )

  return (
    <Wrapper>
      <RailHead
        label={snapshot ? "マーケット指標(ライブ)" : "マーケット指標"}
        en="MARKET"
        icon={<LineChart className="size-4" />}
      />
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between py-2.5"
          >
            <div>
              <div className="text-xs font-semibold">{row.label}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {row.sub}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold tabular-nums">
                {row.value}
              </div>
              <div
                className={
                  "font-mono text-[11px] " +
                  (row.up ? "text-emerald-700" : "text-accent")
                }
              >
                {row.up ? "▲" : "▼"} {row.change}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[9px] tracking-wider text-muted-foreground">
        {asOfLabel}
      </p>
    </Wrapper>
  )
}

export function CitySpotlightWidget() {
  const [index, setIndex] = useState(0)
  const [weather, setWeather] = useState<CityWeatherMap | null>(null)
  const city = CITIES[index]
  const canGoBack = index > 0
  const canGoForward = index < CITIES.length - 1

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

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead
        label="都市スポットライト"
        en="CITY FOCUS"
        icon={<MapPin className="size-4" />}
      />
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-sm bg-muted">
        {city.imageUrl ? (
          <Image
            src={city.imageUrl}
            alt={`${city.name} cityscape`}
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <div
            className={`absolute inset-0 ${TONE_TO_STRIPE[city.tone]} grid place-items-center`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              {city.name.toLowerCase()} skyline
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="bg-foreground px-2 py-0.5 font-mono text-[10px] tracking-wider text-background">
            {city.tag}
          </span>
        </div>
        {city.imageCredit && (
          <div className="absolute right-1.5 top-1.5">
            <span className="bg-black/40 px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-white/80">
              {city.imageCredit}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <h4 className="font-serif text-xl font-bold">{city.jp}</h4>
        <span className="font-mono text-[10px] text-muted-foreground">
          {city.name}
        </span>
      </div>
      {weather?.[city.slug] && (
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          現在 {weather[city.slug].tempC}°C・{describeWeatherCode(weather[city.slug].weatherCode)}
        </p>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded bg-muted p-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            人口
          </div>
          <div className="font-bold">{city.pop}</div>
        </div>
        <div className="rounded bg-muted p-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            GDP
          </div>
          <div className="font-bold">{city.gdp}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {city.note}
      </p>
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
      <Link
        href="/city"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted/40 py-2 font-mono text-[10px] tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        都市一覧を見る →
      </Link>
    </div>
  )
}

type Sponsor = {
  name: string
  label: string
  href: string
  logo: {
    src: string
    width: number
    height: number
  }
  tagline: string
  description: string
  services: string[]
  cta: string
}

const SPONSORS: Sponsor[] = [
  {
    name: "キャピタルランチャーズ株式会社",
    label: "CAPITAL LAUNCHERS",
    href: "https://capital.launchers-g.com/",
    logo: {
      src: "/sponsors/capital-launchers.png",
      width: 240,
      height: 60,
    },
    tagline: "インド進出の判断と準備を、実行可能な計画へ。",
    description:
      "強みの整理、市場適合性の検証、現地連携・人材活用まで、日印ビジネスの立ち上げを支援。",
    services: ["Go/No-Go 判定", "日印連携", "高度人材"],
    cta: "サービスを見る",
  },
  {
    name: "Indobox Inc.",
    label: "INDOBOX",
    href: "https://indobox.co.jp/",
    logo: {
      src: "/sponsors/indobox.png",
      width: 379,
      height: 92,
    },
    tagline: "日本とインドの融合により、新たな価値を生みだす。",
    description:
      "インド進出支援、現地視察、協業型ビジネス創出、人材育成を通じて日本企業とインドをつなぐ。",
    services: ["進出支援", "視察ツアー", "人材育成"],
    cta: "Indoboxを知る",
  },
]

function SponsorCard({
  sponsor,
  variant = "light",
}: {
  sponsor: Sponsor
  variant?: "dark" | "light"
}) {
  const dark = variant === "dark"

  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className={
        "group block rounded-md p-5 transition-shadow hover:shadow-md " +
        (dark
          ? "relative overflow-hidden bg-foreground text-background"
          : "border border-border bg-card text-foreground")
      }
    >
      {dark && (
        <span className="pointer-events-none absolute -right-5 -top-4 select-none font-serif text-[88px] font-black leading-none opacity-10">
          SP
        </span>
      )}
      <div
        className={
          "mb-3 font-mono text-[10px] tracking-[0.22em] " +
          (dark ? "opacity-70" : "text-muted-foreground")
        }
      >
        SPONSORED · {sponsor.label}
      </div>
      <div className="relative rounded-sm border border-border/70 bg-white p-4">
        <Image
          src={sponsor.logo.src}
          alt={`${sponsor.name} logo`}
          width={sponsor.logo.width}
          height={sponsor.logo.height}
          className="h-12 w-full object-contain"
        />
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold leading-tight">
        {sponsor.name}
      </h3>
      <p
        className={
          "mt-2 text-xs font-semibold leading-relaxed " +
          (dark ? "opacity-90" : "text-foreground/90")
        }
      >
        {sponsor.tagline}
      </p>
      <p
        className={
          "mt-2 text-xs leading-relaxed " +
          (dark ? "opacity-75" : "text-muted-foreground")
        }
      >
        {sponsor.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {sponsor.services.map((service) => (
          <span
            key={service}
            className={
              "rounded-sm px-2 py-1 font-mono text-[9px] font-semibold tracking-wider " +
              (dark ? "bg-white/10" : "bg-muted text-foreground/75")
            }
          >
            {service}
          </span>
        ))}
      </div>
      <span
        className={
          "mt-4 inline-flex w-full items-center justify-center rounded-sm py-2 text-xs font-bold transition-colors " +
          (dark
            ? "bg-accent text-white group-hover:bg-accent/90"
            : "border border-foreground text-foreground group-hover:border-accent group-hover:text-accent")
        }
      >
        {sponsor.cta} →
      </span>
    </a>
  )
}

export function PitchWidget() {
  return <SponsorCard sponsor={SPONSORS[0]} variant="dark" />
}

export function SocialWidget() {
  return <SponsorCard sponsor={SPONSORS[1]} variant="dark" />
}

export function NewsletterCTA() {
  return (
    <div className="rounded-md border border-primary/20 bg-primary/10 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
          <Mail className="size-5" />
        </span>
        <div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-primary/70">
            WEEKLY · FREE
          </div>
          <h3 className="mt-1 font-serif text-lg font-bold leading-tight text-primary">
            週刊インドビジネス
          </h3>
        </div>
      </div>
      <p className="mt-3 text-xs leading-6 text-foreground/75">
        インドビジネスの「今」をまとめて、毎週金曜日に配信。
      </p>
      <form
        className="mt-4 space-y-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="email@company.co.jp"
          className="h-9 w-full rounded-sm border border-primary/20 bg-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          className="h-9 w-full rounded-sm bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          今すぐ購読する
        </button>
      </form>
    </div>
  )
}

export function CollabHighlightWidget({
  articles,
}: {
  articles: NewsArticle[]
}) {
  if (articles.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="日印連携ハイライト" en="JAPAN × INDIA" icon="🤝" />
      <ul className="space-y-4">
        {articles.slice(0, 3).map((article) => {
          const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
          return (
            <li key={article.id}>
              <Link
                href={`/article/${article.id}`}
                className="group flex gap-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 ph-stripe-green" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-auto-phrase line-clamp-3 text-xs font-semibold leading-snug group-hover:text-accent">
                    {addJapanesePhraseBreaks(article.title)}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatArticleShortDate(articleDisplayDate(article))}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function EditorialColumnWidget() {
  const articles = usePublicArticles()
  const columns = [...articles]
    .filter((article) => article.category === "column")
    .sort(
      (left, right) =>
        new Date(articleDisplayDate(right)).getTime() -
        new Date(articleDisplayDate(left)).getTime(),
    )
    .slice(0, 3)

  if (columns.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <RailHead
        label="編集部コラム"
        en="EDITORIAL"
        icon={<Feather className="size-3.5" />}
      />
      <ul className="space-y-3">
        {columns.map((article) => {
          const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
          return (
            <li key={article.id}>
              <Link href={`/article/${article.id}`} className="group flex gap-2.5">
                <div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="absolute inset-0 ph-stripe" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-auto-phrase line-clamp-2 text-xs font-semibold leading-snug group-hover:text-accent">
                    {addJapanesePhraseBreaks(article.title)}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                    {article.summary}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatArticleShortDate(articleDisplayDate(article))}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      <Link
        href="/?category=column"
        className="mt-3 flex items-center justify-end gap-0.5 text-[11px] font-semibold text-primary hover:underline"
      >
        一覧を見る
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  )
}
