import { NextResponse } from "next/server"
import {
  ensureUserBetaAccess,
  redeemUserBetaExtension,
} from "@/lib/supabase/beta-access"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const EXTENSION_CODE =
  process.env.BETA_EXTENSION_CODE?.trim() || "IBDJ-EXTEND-2026"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "ログインしてください。" },
      { status: 401 },
    )
  }

  let code: unknown
  try {
    const body = (await request.json()) as { code?: unknown }
    code = body.code
  } catch {
    return NextResponse.json(
      { ok: false, error: "入力内容を確認してください。" },
      { status: 400 },
    )
  }

  if (
    typeof code !== "string" ||
    code.trim().toUpperCase() !== EXTENSION_CODE.toUpperCase()
  ) {
    return NextResponse.json(
      { ok: false, error: "延長コードが正しくありません。" },
      { status: 400 },
    )
  }

  const betaAccess = await ensureUserBetaAccess(user.id)
  if (!betaAccess) {
    return NextResponse.json(
      { ok: false, error: "ご利用期間を確認できません。" },
      { status: 503 },
    )
  }

  const result = await redeemUserBetaExtension(user.id)

  if (result === "success") {
    return NextResponse.json({ ok: true })
  }
  if (result === "not_ready") {
    return NextResponse.json(
      {
        ok: false,
        error: "延長コードは、最初の14日間が終了した後に入力してください。",
      },
      { status: 409 },
    )
  }
  if (result === "already_used") {
    return NextResponse.json(
      { ok: false, error: "このアカウントでは延長コードを使用済みです。" },
      { status: 409 },
    )
  }

  return NextResponse.json(
    { ok: false, error: "延長処理を完了できませんでした。" },
    { status: 503 },
  )
}
