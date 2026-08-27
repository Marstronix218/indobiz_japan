import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"

export function LineRegistrationCampaign() {
  return (
    <section className="mb-8 overflow-hidden rounded-xl border-2 border-[#06c755]/35 bg-[#06c755]/5 px-5 py-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[#059b43]">
            正式リリース記念
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground">
            LINE登録キャンペーン実施中
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            公式LINEで配布するコードを入力すると、当面の期間IndoBiz Japanを無料で購読できます。
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:min-w-52">
          <Button
            asChild
            size="lg"
            className="border-[#06c755] bg-[#06c755] text-white hover:bg-[#05b64e] hover:text-white"
          >
            <a href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden className="size-5" />
              公式LINEを友だち追加
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/line-campaign">コードをお持ちの方</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
