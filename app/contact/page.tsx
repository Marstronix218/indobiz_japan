import { LeadCaptureForm } from "@/components/lead-capture-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お問い合わせ | IndoBiz Japan",
  description:
    "IndoBiz Japan へのお問い合わせ窓口です。ご相談・ご質問・取材・協業のご提案を受け付けています。",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // CONTACT
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            お問い合わせ
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            ご相談・ご質問・取材・協業のご提案など、お問い合わせはこのページで受け付けます。
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <LeadCaptureForm
            title="お問い合わせフォーム"
            description="ご相談内容を自由にご記入ください。会社名のご記入は任意です。"
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
