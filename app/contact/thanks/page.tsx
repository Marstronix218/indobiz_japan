import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function ContactThanksPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
                // THANK YOU
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
                お問い合わせを受け付けました
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                内容を確認のうえ、24時間以内を目安に担当者よりご連絡します。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">トップページへ戻る</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact?leadType=expansion">別の内容を相談する</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
