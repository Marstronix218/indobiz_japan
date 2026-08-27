import { NextResponse } from "next/server"
import {
  LINE_CAMPAIGN_CLAIM,
  hasLineCampaignAccess,
  isValidLineCampaignCode,
} from "@/lib/line-campaign"
import { getServiceClient } from "@/lib/supabase/client"
import {
  getSessionUser,
  getSupabaseServerClient,
} from "@/lib/supabase/server-auth"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "コードを入力するにはログインが必要です。" },
      { status: 401 },
    )
  }
  if (hasLineCampaignAccess(user)) {
    const sessionClient = await getSupabaseServerClient()
    const { error: refreshError } = await sessionClient.auth.refreshSession()
    if (refreshError) {
      return NextResponse.json(
        { ok: false, error: "再度ログインしてからお試しください。" },
        { status: 500 },
      )
    }
    return NextResponse.json({ ok: true })
  }

  const expectedCode = process.env.LINE_CAMPAIGN_CODE?.trim()
  if (!expectedCode) {
    return NextResponse.json(
      { ok: false, error: "現在、無料購読の受付準備中です。" },
      { status: 503 },
    )
  }

  let submittedCode = ""
  try {
    const body = (await request.json()) as { code?: unknown }
    submittedCode =
      typeof body.code === "string" && body.code.length <= 128 ? body.code : ""
  } catch {
    return NextResponse.json(
      { ok: false, error: "コードを入力してください。" },
      { status: 400 },
    )
  }

  if (!isValidLineCampaignCode(submittedCode, expectedCode)) {
    return NextResponse.json(
      { ok: false, error: "コードが正しくありません。" },
      { status: 400 },
    )
  }

  const { error: updateError } =
    await getServiceClient().auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        [LINE_CAMPAIGN_CLAIM]: true,
      },
    })
  if (updateError) {
    console.error("[line-campaign] entitlement update failed:", updateError)
    return NextResponse.json(
      { ok: false, error: "無料購読を有効化できませんでした。" },
      { status: 500 },
    )
  }

  const sessionClient = await getSupabaseServerClient()
  const { error: refreshError } = await sessionClient.auth.refreshSession()
  if (refreshError) {
    console.error("[line-campaign] session refresh failed:", refreshError)
    return NextResponse.json(
      { ok: false, error: "再度ログインしてからお試しください。" },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
