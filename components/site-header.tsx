import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
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

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "font-serif text-sm font-bold tracking-normal"
          : "font-serif text-2xl font-bold tracking-normal sm:text-[32px]"
      }
    >
      <span className="text-primary">IndoBiz</span>{" "}
      <span className="text-accent">Japan</span>
    </span>
  )
}

export function SiteHeader() {
  const dateStr = formatTokyoDate(new Date())

  return (
    <header className="border-b border-border bg-background">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
          <p className="truncate font-semibold text-primary-foreground">
            日本企業向けインド市場インテリジェンス
          </p>
          <div className="flex shrink-0 items-center gap-3 opacity-90">
            <time className="font-mono" suppressHydrationWarning>
              {dateStr}
            </time>
            <span className="hidden h-3 w-px bg-primary-foreground/30 md:block" />
            <div className="hidden items-center md:flex">
              <HeaderAuthControls surface="topbar" />
            </div>
            <span className="hidden h-3 w-px bg-primary-foreground/30 md:block" />
            <Link
              href="/contact?leadType=expansion"
              className="hidden rounded-sm bg-accent px-3 py-1 text-[11px] font-bold text-accent-foreground transition-colors hover:bg-accent/90 sm:inline-flex"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <Link href="/" className="inline-flex min-w-0 items-center gap-4">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-background">
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
              <BrandWordmark />
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                日本企業向けインド市場インテリジェンス · 編集部監修
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-col gap-3 lg:items-end">
            <form
              action="/"
              className="relative hidden w-full max-w-[220px] items-center md:flex"
            >
              <Search className="pointer-events-none absolute right-3 size-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="記事を検索..."
                className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </form>
            <nav
              aria-label="主要カテゴリ"
              className="flex w-full min-w-0 items-center justify-start gap-5 overflow-x-auto text-sm font-semibold lg:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <Link href="/" className="shrink-0 hover:text-accent">
                トップ
              </Link>
              {CATEGORY_SECTIONS.map((section) => (
                <Link
                  key={section.key}
                  href={`/?category=${section.key}`}
                  className="shrink-0 hover:text-accent"
                >
                  {section.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
