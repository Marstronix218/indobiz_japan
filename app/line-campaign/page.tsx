import { redirect } from "next/navigation"
import { getSafeAuthRedirectPath } from "@/lib/auth-redirect"

export const dynamic = "force-dynamic"

/**
 * 旧LINE無料購読コードの入力ページ。記事を全文無料公開にしたのでコードは不要。
 * 公式LINEの自動返信やSNSに残っているリンクから来た人を、行き先へそのまま通す。
 */
export default async function LineCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  redirect(getSafeAuthRedirectPath(params.next ?? null))
}
