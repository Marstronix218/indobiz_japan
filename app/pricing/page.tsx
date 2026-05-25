import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MembershipCaptureForm } from "@/components/membership-capture-form"
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
            現在、すべての機能を無料でご利用いただけます
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            ベータ期間中は、会員登録のみで全記事・日本企業への示唆・市況情報をお読みいただけます。料金プランは正式版の公開に合わせてご案内します。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/signup">新規登録（無料）</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact?leadType=expansion">
                法人導入を相談する
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          id="free-member"
          className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <MembershipCaptureForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
