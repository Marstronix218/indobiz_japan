"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { HeaderAuthControls } from "@/components/header-auth-controls"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CATEGORY_SECTIONS } from "@/lib/news-data"

const utilityLinks = [
  { href: "/pricing", label: "料金プラン" },
  { href: "/company", label: "運営会社" },
  { href: "/contact", label: "お問い合わせ" },
]

export function MobileSiteMenu() {
  return (
    <div className="ml-auto shrink-0 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="メニューを開く"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[min(88vw,22rem)] overflow-y-auto p-0">
          <SheetHeader className="border-b border-border px-5 py-5 text-left">
            <SheetTitle className="font-serif text-xl">メニュー</SheetTitle>
            <SheetDescription>
              記事カテゴリやアカウント情報へ移動できます。
            </SheetDescription>
          </SheetHeader>

          <div className="border-b border-border px-5 py-4">
            <HeaderAuthControls />
          </div>

          <nav aria-label="モバイルメニュー" className="px-5 py-3">
            <ul className="divide-y divide-border">
              <li>
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="block py-3 text-sm font-semibold hover:text-accent"
                  >
                    トップ
                  </Link>
                </SheetClose>
              </li>
              {CATEGORY_SECTIONS.map((section) => (
                <li key={section.key}>
                  <SheetClose asChild>
                    <Link
                      href={`/?category=${section.key}`}
                      className="block py-3 text-sm font-semibold hover:text-accent"
                    >
                      {section.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>

            <ul className="mt-4 border-t border-border pt-2">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      className="block py-2.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
