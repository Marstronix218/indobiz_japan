import Link from "next/link"
import { redirect } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { LineCampaignCodeForm } from "@/components/line-campaign-code-form"
import { Button } from "@/components/ui/button"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"
import { hasLineCampaignAccess } from "@/lib/line-campaign"
import { LINE_ADD_FRIEND_URL } from "@/lib/site-config"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "LINE無料購読コード | IndoBiz Japan",
}

export default async function LineCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = getSafeAuthRedirectPath(params.next ?? null)
  const user = await getSessionUser()
  const campaignPath = `/line-campaign${
    nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""
  }`

  if (user && hasLineCampaignAccess(user)) {
    redirect(nextPath)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-8">
        <p className="text-xs font-bold tracking-[0.12em] text-[#059b43]">
          正式リリース記念
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight">
          LINE無料購読コード
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          IndoBiz Japan公式LINEで届いたコードを入力すると、当面の期間すべての記事を無料でお読みいただけます。
        </p>

        <div className="my-6">
          {user ? (
            <LineCampaignCodeForm nextPath={nextPath} />
          ) : (
            <div className="rounded-xl border border-border bg-background p-5 text-center">
              <p className="mb-4 text-sm leading-6 text-muted-foreground">
                コードをアカウントに登録するため、先にログインしてください。
              </p>
              <Button asChild className="w-full">
                <Link href={`/login?next=${encodeURIComponent(campaignPath)}`}>
                  ログインしてコードを入力
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-5 text-center">
          <p className="mb-3 text-xs leading-5 text-muted-foreground">
            コードをお持ちでない方は、公式LINEを友だち追加してください。すでに友だちの方は、LINEで「無料購読」と送信してください。
          </p>
          <Button asChild variant="outline" className="w-full">
            <a href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle aria-hidden className="size-4" />
              公式LINEを開く
            </a>
          </Button>
          <Link href="/" className="mt-4 inline-block text-xs text-accent hover:underline">
            トップへ戻る
          </Link>
        </div>
      </section>
    </main>
  )
}
