import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | IndoBiz Japan",
  description:
    "IndoBiz Japan の特定商取引法に基づく表記です。販売事業者、所在地、料金、支払方法、解約条件等を記載しています。",
}

interface DisclosureRow {
  label: string
  content: ReactNode
}

const rows: DisclosureRow[] = [
  {
    label: "販売事業者名",
    content: "グローバルランチャーズ株式会社",
  },
  {
    label: "運営統括責任者",
    content: "岸田 高明",
  },
  {
    label: "所在地",
    content: "〒466-0051 愛知県名古屋市昭和区御器所",
  },
  {
    label: "電話番号",
    content: (
      <>
        050-3629-1977
        <br />
        <span className="text-xs leading-6 text-muted-foreground">
          ※受付時間：平日10:00–17:00（土日祝・年末年始を除く）。お問い合わせは原則メールにて承ります。
        </span>
      </>
    ),
  },
  {
    label: "メールアドレス",
    content: (
      <a
        href="mailto:info@g-launchers.com"
        className="text-accent underline-offset-2 hover:underline"
      >
        info@g-launchers.com
      </a>
    ),
  },
  {
    label: "サービス名",
    content: "IndoBiz Japan（インドビジネス情報配信サービス）",
  },
  {
    label: "販売価格",
    content: (
      <>
        LINE登録キャンペーン期間：無料
        <br />
        <span className="text-xs leading-6 text-muted-foreground">
          公式LINEで配布するキャンペーンコードを入力した方は、当面の期間、無料で購読できます。
        </span>
        <br />
        本サービスの料金は決定後、申込前に当サイトで明示します（
        <a
          href="/contact?leadType=expansion"
          className="text-accent underline-offset-2 hover:underline"
        >
          お問い合わせ
        </a>
        ）
      </>
    ),
  },
  {
    label: "商品代金以外の必要料金",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>消費税：表示価格に含まれます。</li>
        <li>
          インターネット接続料金・通信料：本サービスの利用に必要な通信料はお客様のご負担となります。
        </li>
        <li>クレジットカード決済手数料：ありません。</li>
      </ul>
    ),
  },
  {
    label: "支払方法",
    content: "LINE登録キャンペーン期間中はお支払いは発生しません。終了後の条件は決定時にご案内します。",
  },
  {
    label: "支払時期",
    content: "LINE登録キャンペーン期間中はお支払いは発生しません。終了後の条件は決定時にご案内します。",
  },
  {
    label: "サービス提供時期",
    content:
      "ログイン後、公式LINEで配布するキャンペーンコードを入力すると、キャンペーン期間中はすべての記事をご利用いただけます。",
  },
  {
    label: "返品・キャンセル（解約）について",
    content: (
      <div className="space-y-3">
        <p>
          LINE登録キャンペーンは無料のため、返品・返金に関するお手続きはありません。
        </p>
        <p>
          キャンペーン終了後の条件は、料金・申込方法の決定時に当サイトでご案内します。
        </p>
      </div>
    ),
  },
  {
    label: "動作環境",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          対応ブラウザ：最新版の Google Chrome / Safari / Microsoft Edge / Firefox
        </li>
        <li>JavaScript およびログイン状態を保持する Cookie が有効である必要があります。</li>
        <li>
          スマートフォン・タブレットからもご利用いただけます（iOS / Android 最新版を推奨）。
        </li>
      </ul>
    ),
  },
  {
    label: "特別な販売条件",
    content:
      "本サービスは日本国内の事業者および居住者を主な対象としています。Go India 公式メンバー向けの特別な特典を検討しています。詳細は決定後にご案内します。",
  },
]

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // COMMERCE DISCLOSURE
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            特定商取引法に基づく表記
          </h1>
          <p className="text-xs text-muted-foreground">
            最終更新日：2026年7月22日
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <dl className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-2 py-5 first:pt-0 last:pb-0 md:grid-cols-[200px_1fr] md:gap-6"
              >
                <dt className="text-[13px] font-semibold leading-6 text-foreground">
                  {row.label}
                </dt>
                <dd className="text-base leading-8 text-muted-foreground">
                  {row.content}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-[13px] leading-6 text-muted-foreground">
          本ページに記載のない事項については、
          <a
            href="/terms"
            className="text-accent underline-offset-2 hover:underline"
          >
            利用規約・プライバシーポリシー
          </a>
          に従います。
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
