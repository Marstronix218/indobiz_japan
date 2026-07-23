import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * トップページ最上部に表示する「存在意義」イントロ帯。
 * 初見ユーザーに「何のサイトか・誰向けか」を一目で伝える。
 */
export function SiteIntro() {
  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl border-l-2 border-accent pl-4">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-accent">
              FOR JAPANESE BUSINESS · INDIA MARKET INTELLIGENCE
            </p>
            <h1 className="mt-2 font-serif text-2xl font-bold leading-snug text-foreground">
              インド市場の変化を、日本企業の意思決定に使える情報へ。
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
              現地の一次情報を編集部とAIが日本語で整理。インド進出・調達・投資・採用・規制対応の判断に必要なニュースと実務情報を、日本企業向けにお届けします。
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <Link href="/login">ログインして記事を読む</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/contact?leadType=expansion">法人導入を相談する</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
