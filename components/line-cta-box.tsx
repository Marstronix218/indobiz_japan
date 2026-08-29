import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { GO_INDIA_URL, LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export function LineCtaBox() {
  return (
    <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-5 text-center">
      <p className="font-serif text-sm font-bold text-primary">
        IndoBiz Japan 公式LINE
      </p>
      <a
        href={GO_INDIA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0f7d3d]/10 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-[#0f7d3d] hover:bg-[#0f7d3d]/15"
      >
        <span>Go India</span>
        <Image
          src="/goindia.png"
          alt="Go India ロゴ"
          width={22}
          height={22}
          className="h-5 w-5 shrink-0"
        />
      </a>
      <p className="mt-2 text-lg font-black tracking-wide text-foreground">
        無料購読はこちらから！！
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
