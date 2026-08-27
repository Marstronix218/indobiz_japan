import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // PRICING
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            価格
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            正式リリース記念のLINE登録キャンペーンを実施しています。
          </p>
        </div>

        <section className="mx-auto max-w-3xl rounded-3xl border-2 border-accent/40 bg-card p-8 text-center shadow-sm md:p-10">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.22em] text-accent">
            LINE CAMPAIGN
          </span>
          <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-foreground">
            LINEで配布するコードで、当面の期間購読無料です
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            公式LINEで配布されるコードをサイトで入力すると、IndoBiz Japanのすべての記事を無料でお読みいただけます。
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            キャンペーン終了後の料金は、決まり次第このページでご案内します。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer">
                公式LINEを友だち追加
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/line-campaign">コードを入力する</Link>
            </Button>
          </div>
        </section>

        <p className="text-center text-sm leading-7 text-muted-foreground">
          キャンペーン期間中に料金が自動で発生することはありません。
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
