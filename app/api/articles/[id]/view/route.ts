import { NextResponse } from "next/server"
import { recordArticleView } from "@/lib/supabase/article-repository"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { z } from "zod"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) {
    return NextResponse.json({ error: "記事IDが不正です。" }, { status: 400 })
  }
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 })
  }
  await recordArticleView(parsed.data, user.id)
  return new NextResponse(null, { status: 204 })
}
