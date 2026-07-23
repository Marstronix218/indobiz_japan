import { redirect } from "next/navigation"
import { BetaExtensionForm } from "@/components/beta-extension-form"
import { DataUnavailable } from "@/components/data-unavailable"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ensureUserBetaAccess } from "@/lib/supabase/beta-access"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "延長コード入力 | IndoBiz Japan",
}

export default async function ExtendCodePage() {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login?next=/extend-code")
  }

  const betaAccess = await ensureUserBetaAccess(user.id)
  if (!betaAccess) {
    return (
      <DataUnavailable
        title="ご利用期間を確認できません"
        description="現在アクセス状況を確認できません。しばらくしてから再度お試しください。"
        showHomeLink
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="grid flex-1 place-items-center px-4 py-12 sm:px-6">
        <BetaExtensionForm phase={betaAccess.evaluation.phase} />
      </main>

      <SiteFooter />
    </div>
  )
}
