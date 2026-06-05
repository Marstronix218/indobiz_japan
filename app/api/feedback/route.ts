import { NextResponse } from "next/server"
import { getLLMClient } from "@/lib/llm"
import { getArticleById } from "@/lib/supabase/article-repository"
import { getAllSources } from "@/lib/news-data"
import { getSessionUser } from "@/lib/supabase/server-auth"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { recordFeedback } from "@/lib/feedback/repository"

const MIN_MESSAGE_CHARS = 4
const MAX_MESSAGE_CHARS = 2000

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "ストレージが未設定のためフィードバックを受け付けられません" },
      { status: 503 },
    )
  }

  // Logged-in users only.
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json(
      { error: "フィードバックの送信にはログインが必要です" },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 })
  }

  const articleId =
    body && typeof body === "object" && "articleId" in body
      ? String((body as Record<string, unknown>).articleId ?? "").trim()
      : ""
  const message =
    body && typeof body === "object" && "message" in body
      ? String((body as Record<string, unknown>).message ?? "").trim()
      : ""

  if (!articleId) {
    return NextResponse.json({ error: "記事IDがありません" }, { status: 400 })
  }
  if (message.length < MIN_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: "フィードバックが短すぎます" },
      { status: 400 },
    )
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: "フィードバックが長すぎます（2000字以内）" },
      { status: 400 },
    )
  }

  const article = await getArticleById(articleId)
  if (!article || article.workflowStatus !== "published") {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 })
  }

  // Run the strict LLM gate. If the gate itself errors, store nothing that could
  // change the prompt — tell the reader it was received but not actioned.
  let gate
  try {
    const llm = getLLMClient()
    gate = await llm.gradeFeedback({
      message,
      article: {
        title: article.title,
        summary: article.summary,
        category: String(article.category),
        implications: article.implications ?? [],
        sourceTitles: getAllSources(article).map((s) => s.originalTitle),
      },
    })
  } catch (error) {
    console.error("[feedback] gate failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message:
          "フィードバックを受け付けましたが、現在処理できませんでした。後ほど再度お試しください。",
      },
      { status: 502 },
    )
  }

  const { amendmentApplied } = await recordFeedback({
    articleId,
    userId: user.id,
    message,
    gate,
  })

  const accepted = gate.verdict === "ACCEPT"
  return NextResponse.json({
    status: accepted ? "accepted" : "rejected",
    applied: amendmentApplied,
    reason: gate.reason,
    message: accepted
      ? amendmentApplied
        ? "フィードバックを反映しました。今後の記事生成に活かされます。ありがとうございます。"
        : "フィードバックを承認しました。ありがとうございます。"
      : "ご意見ありがとうございます。今回はプロンプトへの反映は見送らせていただきました。",
  })
}
