import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { ImageGenerationError, getImageClient } from "@/lib/image-gen"
import { buildSafeImagePrompt } from "@/lib/image-gen/safe-prompt"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
// Image generation + Storage upload can take 10-30s; give it headroom.
export const maxDuration = 120

/** Cap the summary's contribution so the prompt stays focused, not a wall of text. */
const MAX_SUMMARY_CHARS = 280

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let body: { title?: unknown; summary?: unknown }
  try {
    body = (await request.json()) as { title?: unknown; summary?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const summary = typeof body.summary === "string" ? body.summary.trim() : ""
  if (!title && !summary) {
    return NextResponse.json(
      { ok: false, error: "title または summary が必要です" },
      { status: 400 },
    )
  }

  const imageClient = getImageClient()
  if (!imageClient) {
    return NextResponse.json(
      {
        ok: false,
        error: "画像生成プロバイダが未設定です（IMAGE_PROVIDER / OPENAI_API_KEY を確認してください）",
      },
      { status: 503 },
    )
  }

  const base = [title, summary.slice(0, MAX_SUMMARY_CHARS)].filter(Boolean).join("。 ")
  const prompt = buildSafeImagePrompt(base, title)
  if (!prompt) {
    return NextResponse.json(
      { ok: false, error: "プロンプトを生成できませんでした" },
      { status: 400 },
    )
  }

  try {
    const { imageUrl } = await imageClient.generate({ prompt })
    return NextResponse.json({ ok: true, url: imageUrl })
  } catch (error) {
    const message =
      error instanceof ImageGenerationError
        ? error.message
        : error instanceof Error
          ? error.message
          : "画像生成に失敗しました"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
