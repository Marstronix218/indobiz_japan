import { NextResponse } from "next/server"
import { z } from "zod"
import { recordQualifiedBetaRead } from "@/lib/beta-access"
import { verifyQualifiedBetaReadToken } from "@/lib/beta-read-token"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { isBetaAccessEnabled } from "@/lib/beta-feature"

const bodySchema = z.object({
  articleId: z.string().uuid(),
  readToken: z.string().min(32).max(2048),
})

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
  if (contentLength > 4096) {
    return NextResponse.json({ error: "リクエストが大きすぎます。" }, { status: 413 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
  }

  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "リクエストが不正です。" }, { status: 400 })
  }

  if (!verifyQualifiedBetaReadToken(parsed.readToken, user.id, parsed.articleId)) {
    return NextResponse.json({ error: "閲覧時間を確認できませんでした。" }, { status: 403 })
  }

  try {
    const status = await recordQualifiedBetaRead(user.id, parsed.articleId)
    return NextResponse.json({
      readsCount: status.readsCount,
      requiredReads: status.requiredReads,
      surveyEligible: status.surveyEligible,
    })
  } catch (error) {
    console.error("[beta-read] qualification failed:", error)
    return NextResponse.json({ error: "閲覧状況を保存できませんでした。" }, { status: 400 })
  }
}
