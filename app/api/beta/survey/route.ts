import { NextResponse } from "next/server"
import { z } from "zod"
import { getBetaAccessStatus } from "@/lib/beta-access"
import { getSessionUser, getSupabaseServerClient } from "@/lib/supabase/server-auth"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

const surveySchema = z
  .object({
    role: z.enum(["executive", "business_development", "research", "other"]),
    industry: z.string().trim().max(80),
    indiaStage: z.enum(["considering", "preparing", "operating", "none"]),
    usefulness: z.number().int().min(1).max(5),
    trust: z.number().int().min(1).max(5),
    desiredInformation: z.string().trim().min(1).max(500),
    feedback: z.string().trim().max(1000),
    privacyConsent: z.literal(true),
  })
  .strict()

export async function POST(request: Request) {
  if (!isBetaAccessEnabled()) {
    return NextResponse.json({ error: "β版導線は現在無効です。" }, { status: 404 })
  }
  const requestUrl = new URL(request.url)
  const origin = request.headers.get("origin")
  if (origin && origin !== requestUrl.origin) {
    return NextResponse.json({ error: "許可されていない送信元です。" }, { status: 403 })
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "JSONリクエストが必要です。" }, { status: 415 })
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0")
  if (contentLength > 16_384) {
    return NextResponse.json({ error: "回答が大きすぎます。" }, { status: 413 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
  }

  let answers: z.infer<typeof surveySchema>
  try {
    answers = surveySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "必須項目を確認してください。" }, { status: 400 })
  }

  const accessBefore = await getBetaAccessStatus(user.id)
  if (!accessBefore.surveyEligible) {
    return NextResponse.json(
      { error: `アンケートには${accessBefore.requiredReads}記事の閲覧が必要です。` },
      { status: 403 },
    )
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.rpc("submit_beta_survey", { p_answers: answers })
  if (error) {
    console.error("[beta-survey] submission failed:", error.message)
    return NextResponse.json({ error: "回答を保存できませんでした。" }, { status: 500 })
  }

  const accessAfter = await getBetaAccessStatus(user.id)
  if (!accessAfter.hasFullAccess) {
    return NextResponse.json(
      { error: "アクセス権を有効化できませんでした。運営へお問い合わせください。" },
      { status: 409 },
    )
  }

  return NextResponse.json({ ok: true })
}
