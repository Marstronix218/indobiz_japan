import { NextResponse } from "next/server"
import { runDailyXPost } from "@/lib/social/daily-x-post"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

/**
 * 毎日 7:00 / 12:15 / 21:00 (JST) に、まだ投稿していない記事のうち点数が最も高いものを
 * 1件ずつXへ投稿する(朝・昼・夜の3枠)。vercel.json の schedules.x-post-* から呼ばれる。
 *
 * 手動確認: `?dryRun=1` を付けると投稿せず、選ばれる記事と投稿文だけ返す。
 *   curl -H "Authorization: Bearer $CRON_SECRET" "https://<host>/api/cron/post-x?dryRun=1"
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== "production"
  const header = request.headers.get("authorization") ?? ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : header
  return token === secret
}

async function handle(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1"
  try {
    const result = await runDailyXPost({ dryRun })
    if (result.status === "skipped") {
      console.warn(`[cron/post-x] skipped: ${result.reason}`)
    } else {
      console.log(`[cron/post-x] ${result.status}: slot=${result.slot} article=${result.articleId}`)
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[cron/post-x] failed:", message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return handle(request)
}

export async function POST(request: Request) {
  return handle(request)
}
