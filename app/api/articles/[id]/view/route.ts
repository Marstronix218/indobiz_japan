import { NextResponse } from "next/server"
import { recordArticleView } from "@/lib/supabase/article-repository"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  await recordArticleView(id)
  return new NextResponse(null, { status: 204 })
}
