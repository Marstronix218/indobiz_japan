import { ArrowUpRight } from "lucide-react"

const EVENT_URL = "https://india-hamamatsu.com"

export function EventNoticeBoard() {
  return (
    <section
      aria-labelledby="event-notice-heading"
      className="mb-6 overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-accent/10 shadow-sm"
    >
      <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(22.5rem,1.15fr)]">
        <div className="min-w-0 p-4 sm:p-5 md:self-center md:px-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-primary-foreground">
              EVENT INFORMATION
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground">
              // COMMUNITY BOARD
            </span>
          </div>

          <h2
            id="event-notice-heading"
            className="font-serif text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            インドはままつ
            <span className="block">フェスティバル</span>
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            インド料理、音楽、ダンスや文化体験が集まる浜松のフェスティバルです。
          </p>

          <a
            href={EVENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-xs font-bold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            公式サイトを開く
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="h-52 min-w-0 overflow-hidden border-t border-border bg-card md:h-full md:min-h-72 md:border-l md:border-t-0">
          <iframe
            src={EVENT_URL}
            title="インドはままつフェスティバル公式サイト"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="block border-0 bg-background"
            style={{
              width: "250%",
              height: "250%",
              transform: "scale(0.4)",
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
    </section>
  )
}
