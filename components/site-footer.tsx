import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from "@/lib/news-data"
import { GO_INDIA_URL } from "@/lib/site-config"

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/goindia.png"
                alt="Go India"
                width={56}
                height={56}
                className="size-14 shrink-0 object-contain"
              />
              <h4 className="font-serif text-xl font-bold">IndoBiz Japan</h4>
            </div>
            <p className="max-w-sm text-base leading-8 text-primary-foreground/75">
              日本企業向けに、インド市場の短報、業界別ウォッチ、進出・採用の示唆を届ける情報サービスです。
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]">
              Categories
            </h5>
            <ul className="space-y-2 text-[13px] leading-6 text-primary-foreground/75">
              {CATEGORY_OPTIONS.map((category) => (
                <li key={category}>
                  <Link
                    href={`/?category=${category}`}
                    className="transition-opacity hover:opacity-100"
                  >
                    {CATEGORY_LABELS[category]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]">
              Navigation
            </h5>
            <ul className="space-y-2 text-[13px] leading-6 text-primary-foreground/75">
              <li>
                <Link href="/contact" className="transition-opacity hover:opacity-100">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-opacity hover:opacity-100">
                  料金について
                </Link>
              </li>
              <li>
                <a
                  href={GO_INDIA_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-100"
                >
                  Go India について
                </a>
              </li>
              <li>
                <Link href="/company" className="transition-opacity hover:opacity-100">
                  運営会社
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-opacity hover:opacity-100">
                  利用規約・プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/legal/tokushoho" className="transition-opacity hover:opacity-100">
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/15" />

        <p className="text-center font-mono text-[11px] text-primary-foreground/60">
          &copy; {new Date().getFullYear()} IndoBiz Japan. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
