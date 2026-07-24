import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { HeaderAuthControls } from "@/components/header-auth-controls"
import { CATEGORY_SECTIONS } from "@/lib/news-data"
import { formatDateWithWeekday } from "@/lib/date-format"

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "font-serif text-sm font-bold tracking-normal"
          : "font-serif text-3xl font-bold tracking-normal sm:text-[34px]"
      }
    >
      <span className="text-primary">IndoBiz</span>{" "}
      <span className="text-accent">Japan</span>
    </span>
  )
}

export function SiteHeader() {
  const dateStr = formatDateWithWeekday(new Date())

  return (
    <header className="border-b border-border bg-background">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
          {/* 下位ブレークポイント用。lg 以上ではロゴ右のタグラインが同じ役割を担う */}
          <p className="truncate font-semibold text-primary-foreground lg:hidden">
            日本企業向けインド市場インテリジェンス
          </p>
          <div className="flex shrink-0 items-center gap-3 opacity-90 lg:ml-auto">
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

      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                <Image
                  src="/goindia.png"
                  alt="IndoBiz Japan logo"
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  priority
                />
              </span>
              <span className="min-w-0 leading-tight">
                <BrandWordmark />
              </span>
            </Link>
            <span className="hidden h-8 w-px shrink-0 bg-border lg:block" />
            <p className="hidden min-w-0 text-[13px] font-medium leading-snug text-muted-foreground lg:block">
              インド市場の変化を、
              <br />
              日本企業の意思決定に使える情報へ。
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-2 lg:items-end">
            <form
              action="/"
              className="relative hidden w-full max-w-[200px] items-center md:flex"
            >
              <Search className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="記事を検索..."
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </form>
            <nav
              aria-label="主要カテゴリ"
              className="flex w-full min-w-0 items-center justify-start gap-4 overflow-x-auto text-[13px] font-semibold lg:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
