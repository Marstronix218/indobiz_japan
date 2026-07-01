import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { GooeyGradientBackground } from "@/components/gooey-gradient-background"
import { GlowCategoryLink } from "@/components/glow-category-link"
import { HeaderAuthControls } from "@/components/header-auth-controls"
import { CATEGORY_SECTIONS } from "@/lib/news-data"

function formatTokyoDate(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${value("year")}年${value("month")}月${value("day")}日 (${value("weekday")})`
}

function BrandWordmark({
  compact = false,
  inverted = false,
}: {
  compact?: boolean
  inverted?: boolean
}) {
  return (
    <span
      className={
        compact
          ? "font-serif text-sm font-bold tracking-normal"
          : "font-serif text-2xl font-bold tracking-normal sm:text-[32px]"
      }
    >
      <span className={inverted ? "text-white" : "text-primary"}>IndoBiz</span>{" "}
      <span className={inverted ? "text-orange-300" : "text-accent"}>Japan</span>
    </span>
  )
}

function StaticCategoryLinks() {
  return (
    <>
      <Link href="/" className="glow-category-button group shrink-0">
        <span className="relative z-10">トップ</span>
      </Link>
      {CATEGORY_SECTIONS.map((section) => (
        <Link
          key={section.key}
          href={`/?category=${section.key}`}
          className="glow-category-button group shrink-0"
        >
          <span className="relative z-10">{section.label}</span>
        </Link>
      ))}
    </>
  )
}

export function SiteHeader({
  withBackground = true,
}: {
  withBackground?: boolean
}) {
  const dateStr = formatTokyoDate(new Date())

  const content = (
    <>
      <div className="border-b border-white/15 bg-black/10 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
          <p className="truncate font-semibold text-white">
            日本企業向けインド市場インテリジェンス
          </p>
          <div className="flex shrink-0 items-center gap-3 text-white/90">
            <time className="font-mono" suppressHydrationWarning>
              {dateStr}
            </time>
            <span className="hidden h-3 w-px bg-white/35 md:block" />
            <div className="hidden items-center md:flex">
              <HeaderAuthControls surface="topbar" />
            </div>
            <span className="hidden h-3 w-px bg-white/35 md:block" />
            <Link
              href="/contact?leadType=expansion"
              className="hidden rounded-sm bg-white/90 px-3 py-1 text-[11px] font-bold text-emerald-950 transition-colors hover:bg-orange-200 sm:inline-flex"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <Link href="/" className="inline-flex min-w-0 items-center gap-4">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-white/30 bg-white/90 shadow-sm">
              <Image
                src="/goindia.png"
                alt="IndoBiz Japan logo"
                width={56}
                height={56}
                className="size-full object-contain"
                priority
              />
            </span>
            <span className="min-w-0 leading-tight">
              <BrandWordmark inverted />
              <span className="mt-1 block truncate text-xs text-white/80">
                日本企業向けインド市場インテリジェンス · 編集部監修
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-col gap-3 lg:items-end">
            <form
              action="/"
              className="relative hidden w-full max-w-[220px] items-center md:flex"
            >
              <Search className="pointer-events-none absolute right-3 size-4 text-emerald-900/60" />
              <input
                type="search"
                name="q"
                placeholder="記事を検索..."
                className="h-10 w-full rounded-md border border-white/35 bg-white/90 px-3 pr-10 text-sm text-emerald-950 outline-none placeholder:text-emerald-900/45 focus:border-white focus:ring-2 focus:ring-white/35"
              />
            </form>
            <nav
              aria-label="主要カテゴリ"
              className="flex w-full min-w-0 items-center justify-start gap-2 overflow-x-auto text-sm font-semibold text-white lg:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Suspense fallback={<StaticCategoryLinks />}>
                <GlowCategoryLink href="/" category={null}>
                  トップ
                </GlowCategoryLink>
                {CATEGORY_SECTIONS.map((section) => (
                  <GlowCategoryLink
                    key={section.key}
                    href={`/?category=${section.key}`}
                    category={section.key}
                  >
                    {section.label}
                  </GlowCategoryLink>
                ))}
              </Suspense>
            </nav>
          </div>
        </div>
      </div>
    </>
  )

  if (!withBackground) {
    return <header>{content}</header>
  }

  return (
    <header>
      <GooeyGradientBackground
        className="text-white"
        contentClassName="bg-black/25"
      >
        {content}
      </GooeyGradientBackground>
    </header>
  )
}
