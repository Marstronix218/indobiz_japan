import { NextResponse } from "next/server"
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fetchIndiaNews } from "@/lib/scrapers/fetch-india-news"
import { clusterArticles, readClusterOptionsFromEnv } from "@/lib/clustering"
import type { RawSourceArticle } from "@/lib/automation"
import { OpenAIClient } from "@/lib/llm/openai-client"
import { buildSynthesisPrompt, buildSynthesisPromptCoreFirst } from "@/lib/llm/prompt"
import type { SynthesisInput, SynthesisOutput } from "@/lib/llm/types"
import { isAdminRequest } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

// 開発専用の使い捨て実験ルート。
// プロンプト構造「フラット統合(現行) vs 主軸＋肉付け(新)」をA/B比較する。
// モデルは gpt-5-mini に固定し、唯一の変数をプロンプト構造だけに絞る。検証後は削除可。

const EXP_DIR = resolve(process.cwd(), "scripts/experiments")
const FROZEN_PATH = resolve(EXP_DIR, "frozen-clusters.json")
const MODEL = "gpt-5-mini"

interface FrozenFile {
  capturedAt: string
  clusterOptions: ReturnType<typeof readClusterOptionsFromEnv>
  clusters: RawSourceArticle[][]
}

function clusterRecency(cluster: RawSourceArticle[]): number {
  return Math.max(...cluster.map((a) => Date.parse(a.publishedAt) || 0))
}

function toSynthesisInput(cluster: RawSourceArticle[]): SynthesisInput {
  // 本文が最も充実した1本を核として先頭に並べる(両アーム共通の入力)。
  const ordered = [...cluster].sort(
    (a, b) => (b.bodyText?.length ?? 0) - (a.bodyText?.length ?? 0),
  )
  return {
    cluster: ordered.map((a) => ({
      source: a.source,
      sourceUrl: a.url,
      publishedAt: a.publishedAt,
      title: a.title,
      bodyText: (a.bodyText ?? "").replace(/\s+/g, " ").trim(),
    })),
    categoryHint: ordered[0]?.legacyCategory,
    industryHints: ordered[0]?.industryHints,
  }
}

async function handleFreeze(n: number): Promise<NextResponse> {
  const { rawArticles, errors } = await fetchIndiaNews()
  const clusters = clusterArticles(rawArticles, readClusterOptionsFromEnv())
  const multi = clusters
    .filter((c) => c.length >= 2)
    .sort((a, b) => b.length - a.length || clusterRecency(b) - clusterRecency(a))
    .slice(0, n)

  mkdirSync(EXP_DIR, { recursive: true })
  const payload: FrozenFile = {
    capturedAt: new Date().toISOString(),
    clusterOptions: readClusterOptionsFromEnv(),
    clusters: multi,
  }
  writeFileSync(FROZEN_PATH, JSON.stringify(payload, null, 2), "utf8")

  return NextResponse.json({
    ok: true,
    mode: "freeze",
    fetched: rawArticles.length,
    fetchErrors: errors.length,
    multiSourceClustersTotal: clusters.filter((c) => c.length >= 2).length,
    frozen: multi.length,
    sizes: multi.map((c) => c.length),
    path: FROZEN_PATH,
  })
}

function renderArm(label: string, out: SynthesisOutput): string {
  return [
    `#### ${label}`,
    `- **タイトル**: ${out.title}`,
    `- **カテゴリ**: ${out.category}`,
    `- **インド関連性**: ${out.indiaRelevance.score} — ${out.indiaRelevance.reason}`,
    `- **日本企業関心度**: ${out.japaneseBusinessRelevance.score} — ${out.japaneseBusinessRelevance.reason}`,
    `- **業界タグ**: ${out.industryTags.join(", ") || "（なし）"}`,
    "",
    "**本文:**",
    "",
    out.summary,
    "",
    "**日本企業への示唆:**",
    ...out.implications.map((s) => `- ${s}`),
    "",
  ].join("\n")
}

async function handleRun(): Promise<NextResponse> {
  if (!existsSync(FROZEN_PATH)) {
    return NextResponse.json(
      { ok: false, error: "frozen-clusters.json が無い。先に ?mode=freeze を実行してください" },
      { status: 400 },
    )
  }
  const frozen = JSON.parse(readFileSync(FROZEN_PATH, "utf8")) as FrozenFile
  const llm = new OpenAIClient({ model: MODEL })

  const lines: string[] = [
    `# A/Bテスト結果: フラット統合(A) vs 主軸＋肉付け(B)`,
    "",
    `- 実行時刻: ${new Date().toISOString()}`,
    `- 凍結データ: ${frozen.capturedAt} 取得 / ${frozen.clusters.length} クラスタ`,
    `- モデル(両アーム共通): ${MODEL}`,
    `- 品質ループ・画像生成: OFF`,
    "",
    "---",
    "",
  ]

  const summary: Array<{ cluster: number; size: number; ok: boolean; error?: string }> = []

  for (let i = 0; i < frozen.clusters.length; i++) {
    const cluster = frozen.clusters[i]
    const input = toSynthesisInput(cluster)
    lines.push(`## クラスタ ${i + 1}（${cluster.length}ソース）`, "")
    lines.push("**ソース一覧（先頭＝核）:**", "")
    input.cluster.forEach((s, j) => {
      lines.push(`${j + 1}. ${j === 0 ? "🟢核 " : ""}[${s.source}] ${s.title}（本文 ${s.bodyText.length} 字）`)
    })
    lines.push("")

    try {
      const [a, b] = await Promise.all([
        llm.synthesize(input, { promptBuilder: buildSynthesisPrompt }),
        llm.synthesize(input, { promptBuilder: buildSynthesisPromptCoreFirst }),
      ])
      lines.push(renderArm("アームA（現行・フラット統合）", a))
      lines.push("---", "")
      lines.push(renderArm("アームB（新・主軸＋肉付け）", b))
      lines.push("\n===\n")
      summary.push({ cluster: i + 1, size: cluster.length, ok: true })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      lines.push(`> ⚠️ 合成失敗: ${msg}`, "", "===", "")
      summary.push({ cluster: i + 1, size: cluster.length, ok: false, error: msg })
    }
  }

  mkdirSync(EXP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const outPath = resolve(EXP_DIR, `ab-results-${stamp}.md`)
  writeFileSync(outPath, lines.join("\n"), "utf8")

  return NextResponse.json({ ok: true, mode: "run", model: MODEL, path: outPath, summary })
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "disabled in production" }, { status: 403 })
  }
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const mode = url.searchParams.get("mode")
  const n = Math.max(1, Math.min(20, Number(url.searchParams.get("n") ?? 5)))

  try {
    if (mode === "freeze") return await handleFreeze(n)
    if (mode === "run") return await handleRun()
    return NextResponse.json(
      { ok: false, error: "mode は freeze か run を指定してください" },
      { status: 400 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
