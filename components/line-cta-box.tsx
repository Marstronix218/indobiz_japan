import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export function LineCtaBox() {
  return (
    <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-5 text-center">
      <p className="font-serif text-sm font-bold text-primary">
        IndoBiz Japan 公式LINE
      </p>
      <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
        公式LINEで無料購読コードを配布中です。すでに友だちの方は「無料購読」と送信してください。
      </p>
      <a
        href={LINE_ADD_FRIEND_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#06c755] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#05b64e]"
      >
        <MessageCircle aria-hidden className="size-4" />
        公式LINEを友だち追加
      </a>
      <Link
        href="/line-campaign"
        className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
      >
        コードをお持ちの方
      </Link>
    </div>
  )
}
