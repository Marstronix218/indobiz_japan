import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

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
            現在はベータ版として、すべての機能を無料でご提供しています。
          </p>
        </div>

        <section className="mx-auto max-w-3xl rounded-3xl border-2 border-accent/40 bg-card p-8 text-center shadow-sm md:p-10">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.22em] text-accent">
            BETA
          </span>
          <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-foreground">
            アカウント登録後の初回アクセスから14日間は無料です
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            記事の閲覧にはアカウント登録とログインが必要です。最初の14日間が終了した後、アンケートにご回答いただいた方はさらに14日間ご利用いただけます。
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            本サービスは9月以降に有料化予定です。料金は未定ですが、Go India 公式メンバーの皆様には特別な特典をご用意することを検討しています。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/signup">新規登録（無料）</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">
                お問い合わせ
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <p className="text-center text-sm leading-7 text-muted-foreground">
          料金・申込方法の詳細は、決定後にこのページでご案内いたします。
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
