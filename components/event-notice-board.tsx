import { ArrowUpRight } from "lucide-react"

const EVENT_URL = "https://www.instagram.com/india_hamamatsu/"

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
            <span className="block">フェスティバル</span>
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            インド料理、音楽、ダンスや文化体験が集まる浜松のフェスティバルです。
          </p>

          <a
            href={EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            公式Instagramを開く
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="h-40 min-w-0 overflow-hidden border-t-2 border-accent/20 bg-card md:h-full md:min-h-56 md:border-l-2 md:border-t-0">
          <iframe
            src={EVENT_URL}
            title="インドはままつフェスティバル公式Instagram"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="block border-0 bg-background"
            style={{
              width: "250%",
              height: "300%",
              transform: "translateY(-2rem) scale(0.4)",
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
    </aside>
  )
}
