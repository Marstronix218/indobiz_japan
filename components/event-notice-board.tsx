import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

const EVENT_URL = "https://www.instagram.com/p/DcOESZbzSJA/"

export function EventNoticeBoard() {
  return (
    <aside
      aria-labelledby="event-notice-heading"
      className="mb-8 overflow-hidden rounded-lg border-2 border-accent/35 border-t-4 border-t-accent bg-gradient-to-br from-accent/10 via-card to-secondary shadow-sm"
    >
      <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(22.5rem,1.15fr)]">
        <div className="min-w-0 p-3.5 sm:p-4 md:self-center md:px-5">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-accent px-2 py-1 text-[10px] font-bold tracking-wider text-accent-foreground">
              広告・お知らせ
            </span>
          </div>

          <h2
            id="event-notice-heading"
            className="font-serif text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            インドはままつ
            <span className="block">フェスティバル 2026</span>
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            インド料理、音楽、ダンスや文化体験が集まる浜松のフェスティバルです。
          </p>
          <p className="mt-1.5 text-[13px] font-semibold leading-5 text-foreground">
            9/12（土）10:00–19:00・9/13（日）10:00–17:00
            <span className="block font-normal text-muted-foreground">
              新川モール（浜松市中央区田町230-28）
            </span>
          </p>

          <a
            href={EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            公式Instagramを開く
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="flex min-w-0 items-center border-t-2 border-accent/20 bg-card md:border-l-2 md:border-t-0">
          <a href={EVENT_URL} target="_blank" rel="noopener noreferrer" className="block w-full">
            <Image
              src="/hamamatsu-festival-2026-banner.png"
              alt="インドはままつフェスティバル 2026 — 9月12日（土）・13日（日）、新川モール（浜松市中央区田町230-28）"
              width={884}
              height={300}
              className="h-auto w-full"
              priority={false}
            />
          </a>
        </div>
      </div>
    </aside>
  )
}
