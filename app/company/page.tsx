import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "運営会社 | IndoBiz Japan",
  description:
    "IndoBiz Japan の運営体制です。運営会社および共同運営（サポート）各社を記載しています。",
}

interface CompanyRow {
  role: string
  companies: ReactNode
}

const rows: CompanyRow[] = [
  {
    role: "運営会社",
    companies: (
      <div>
        <div className="font-semibold">グローバルランチャーズ株式会社</div>
        <div className="mt-1">
          <a
            href="https://global.launchers-g.com"
            className="text-accent underline-offset-2 hover:underline"
          >
            https://global.launchers-g.com
          </a>
        </div>
      </div>
    ),
  },
  {
    role: "共同運営（サポート）",
    companies: (
      <ul className="space-y-1">
        <li>
          <div className="font-semibold">キャピタルランチャーズ株式会社</div>
          <div className="mt-1">
            <a
              href="https://capital.launchers-g.com"
              className="text-accent underline-offset-2 hover:underline"
            >
              https://capital.launchers-g.com
            </a>
          </div>
        </li>
        <li>
          <div className="font-semibold">Indobox株式会社</div>
          <div className="mt-1">
            <a
              href="https://indobox.co.jp"
              className="text-accent underline-offset-2 hover:underline"
            >
              https://indobox.co.jp
            </a>
          </div>
        </li>
      </ul>
    ),
  },
]

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // COMPANY
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            運営会社
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            IndoBiz Japan は、以下の体制で運営しています。
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <dl className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.role}
                className="grid gap-2 py-5 first:pt-0 last:pb-0 md:grid-cols-[220px_1fr] md:gap-6"
              >
                <dt className="text-[13px] font-semibold leading-6 text-foreground">
                  {row.role}
                </dt>
                <dd className="text-base leading-8 text-muted-foreground">
                  {row.companies}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-[13px] leading-6 text-muted-foreground">
          取引条件等の詳細は
          <a
            href="/legal/tokushoho"
            className="text-accent underline-offset-2 hover:underline"
          >
            特定商取引法に基づく表記
          </a>
          、サービスのご利用条件は
          <a
            href="/terms"
            className="text-accent underline-offset-2 hover:underline"
          >
            利用規約・プライバシーポリシー
          </a>
          をご確認ください。
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
