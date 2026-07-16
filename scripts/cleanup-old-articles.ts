#!/usr/bin/env -S npx tsx
/**
 * One-off maintenance: re-evaluate articles that predate the AI quality-check
 * workflow (published rows with no quality_verdict) and clean them up.
 *
 * Because the original source bodies were never stored (article_sources rows
 * have empty evidence_snippets), this runs an INTRINSIC quality check — judging
 * each article on its own text (relevance, originality/anti-template, news
 * substance, internal consistency). Copyright/source-reuse is NOT evaluated.
 *
 * Two phases:
 *   npx tsx scripts/cleanup-old-articles.ts evaluate [--limit N]
 *     → backs up every target row+sources, runs the check, generates rewrites
 *       for REVISION verdicts, writes a results JSON. No DB mutation.
 *   npx tsx scripts/cleanup-old-articles.ts apply <results.json>
 *     → PASS: mark verdict; REVISION: overwrite content + mark; REJECT: delete
 *       row (sources cascade) + storage image.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"
import Anthropic from "@anthropic-ai/sdk"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// ---- env ----
const envPath = resolve(process.cwd(), ".env.local")
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (!m) continue
  if (process.env[m[1]] === undefined) {
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[m[1]] = v
  }
}

const BUCKET = process.env.SUPABASE_IMAGE_BUCKET ?? "article-images"
const ANTHROPIC_MODEL = process.env.LLM_MODEL_ANTHROPIC ?? "claude-sonnet-4-6"
const CONCURRENCY = 4
const BACKUP_DIR = resolve(process.cwd(), "scripts/cleanup-backup")

function sb(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 0 })

// ---- prompts (no-source, intrinsic) ----
const CHECK_SYSTEM = `あなたはインド市場専門の編集チーフです。すでに公開済みの日本語記事を、参考元の原文なしで「記事単体」として評価します。著作権・原文流用の照合は今回できないため評価対象外です。以下の観点だけで判定してください。

【評価観点(記事単体で判断できるもの)】
A. インド/日本企業関連性: インド(またはインド×日本ビジネス)を主題にしているか。インドとほぼ無関係、または日本企業への示唆が成立しない題材は価値が低い。
B. 独自性・脱テンプレート: 「本記事のポイント」が、記事で起きたことを具体的に要約しているか。「背景として」「示唆を整理する」「注視が必要」「今後の動向が注目される」等の、どの記事にも使い回せる汎用・空虚な表現に終始していないか。
C. ニュース価値・実体: 具体的な事実(数値・固有名詞・制度・出来事)に基づく実体のある記事か。中身が薄い一般論だけ、または陳腐・些末でないか。
D. 文章品質・整合: タイトルと本文の主張が一致し、同一の言い回しの繰り返しがなく、category と industryTags が内容と整合しているか。

【判定ルール — 削除は不可逆。原則として修正(REVISION)で救済し、REJECT は明確に救済不能な場合のみ】
- PASS: 4観点すべて重大な問題なし。具体性があり示唆も実用的。掲載継続。
- REVISION: 題材・事実はしっかりしているが、テンプレ的な示唆・空虚な表現・タグ不整合・冗長など修正可能な弱点がある。書き直しで改善できる。
- REJECT: 書き直しても掲載に値しない場合のみ。例:本文が実質的に空/破綻、インドとも日本企業とも無関係、事実の実体がなく一般論・憶測だけ、ニュースとして無価値。迷う場合は必ず REVISION にすること。

【出力形式】JSONオブジェクトのみ。前後に説明やコードフェンスを付けない。
{ "verdict": "PASS"|"REVISION"|"REJECT", "issues": ["問題点を1項目1文で短く。PASSは空配列"], "revisionInstructions": "REVISIONの場合のみ、何をどう直すか箇条書き。PASS/REJECTは空文字列" }`

const REWRITE_SYSTEM = `あなたはインド市場を取材する日本語ビジネスジャーナリストです。日本企業のインド事業に関心を持つ読者向けに、独自の視点で書かれた記事を制作します。今回は既存の公開記事を、編集チーフの指摘に沿って書き直します。

【厳守事項】
- 参考元の原文は手元にありません。元記事に書かれている事実(数値・固有名詞・日付・制度・出来事)のみを使い、新しい事実・数値を創作してはいけません。検証できない新情報を足さないこと。
- 表現・分析・示唆はあなた自身の言葉で書き起こす。原文の言い回しの流用や、テンプレ的な汎用表現(「背景として」「意思決定では」「示唆を整理する」「注視が必要」「今後の動向が注目される」等)を避ける。
- 「本記事のポイント」(implications)は、何がどう変わり誰に関係するかが分かる具体的な要約を3点。
- summary は日本語で約450〜600字の自然な記事本文。
- category は次のいずれか1つ: economy / regulation / social / culture / market / column
- industryTags は次から該当するもののみを0個以上: automotive, semiconductor, machine_tools, food, chemicals, logistics, agriculture, steel, education, entertainment, talent

【出力形式】JSONオブジェクトのみ。前後に説明やコードフェンスを付けない。
{ "title": "...", "summary": "...", "implications": ["...","...","..."], "category": "...", "industryTags": ["..."] }`

interface ArticleRow {
  id: string
  title: string
  summary: string
  implications: string[]
  category: string
  industry_tags: string[]
  image_url: string | null
}

function articleBlock(a: ArticleRow): string {
  const imp = (a.implications ?? []).map((s, i) => `${i + 1}. ${s}`).join("\n") || "(なし)"
  return `タイトル: ${a.title}
カテゴリ: ${a.category}
業界タグ: ${(a.industry_tags ?? []).join(", ") || "(なし)"}

本文:
${a.summary}

本記事のポイント:
${imp}`
}

function extractJson(raw: string): any {
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  if (start === -1 || end === -1) throw new Error("no JSON object in response")
  return JSON.parse(raw.slice(start, end + 1))
}

function isCreditError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /credit balance is too low|insufficient_quota|exceeded your current quota/i.test(m)
}

async function callOnce(system: string, user: string): Promise<string> {
  const res = await anthropic.messages.create(
    {
      model: ANTHROPIC_MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: user }],
    },
    { timeout: 90000 },
  )
  const block = res.content.find((b) => b.type === "text")
  if (!block || block.type !== "text") throw new Error("Claude response has no text block")
  return block.text
}

async function callLLM(system: string, user: string): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await callOnce(system, user)
    } catch (e) {
      lastErr = e
      if (isCreditError(e)) throw e // no point retrying a billing failure
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** attempt, 8000) + Math.random() * 400))
    }
  }
  throw lastErr
}

const VALID_CATEGORIES = ["economy", "regulation", "social", "culture", "market", "column"]
const VALID_TAGS = ["automotive", "semiconductor", "machine_tools", "food", "chemicals", "logistics", "agriculture", "steel", "education", "entertainment", "talent"]

async function mapPool<T, R>(items: T[], n: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const i = idx++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
  return out
}

interface Result {
  id: string
  title: string
  image_url: string | null
  verdict: "PASS" | "REVISION" | "REJECT" | "ERROR"
  issues: string[]
  revisionInstructions: string
  revision?: { title: string; summary: string; implications: string[]; category: string; industryTags: string[] }
  rewriteFailed?: boolean
  error?: string
}

async function evaluate(limit?: number) {
  const client = sb()
  let q = client
    .from("articles")
    .select("id, title, summary, source, source_url, published_at, category, industry_tags, implications, content_type, visibility, workflow_status, image_url, featured, is_synthesized, dedupe_key, created_at, quality_verdict, quality_notes, revision_count, last_quality_check_at, article_sources(*)")
    .is("quality_verdict", null)
    .eq("workflow_status", "published")
    .order("created_at", { ascending: true })
  const { data, error } = await q
  if (error) throw new Error(error.message)
  let rows = data as any[]
  if (limit) rows = rows.slice(0, limit)
  console.log(`[evaluate] target articles: ${rows.length}`)

  // backup
  mkdirSync(BACKUP_DIR, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = resolve(BACKUP_DIR, `backup-${ts}.json`)
  writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`[evaluate] backup written: ${backupPath}`)

  const results = await mapPool<any, Result>(rows, CONCURRENCY, async (row, i) => {
    const a: ArticleRow = row
    const base: Result = { id: a.id, title: a.title, image_url: a.image_url, verdict: "ERROR", issues: [], revisionInstructions: "" }
    try {
      const raw = await callLLM(CHECK_SYSTEM, `【評価対象記事】\n${articleBlock(a)}\n\n---\nシステム指示に従い、JSONのみを返してください。`)
      const parsed = extractJson(raw)
      const verdict = parsed.verdict as Result["verdict"]
      base.verdict = verdict
      base.issues = Array.isArray(parsed.issues) ? parsed.issues : []
      base.revisionInstructions = typeof parsed.revisionInstructions === "string" ? parsed.revisionInstructions : ""
      process.stdout.write(`  [${i + 1}/${rows.length}] ${verdict.padEnd(8)} ${a.title.slice(0, 40)}\n`)

      if (verdict === "REVISION") {
        try {
          const user = `【書き直す既存記事】\n${articleBlock(a)}\n\n【編集チーフの指摘】\n${base.issues.join("\n")}\n\n【修正指示】\n${base.revisionInstructions}\n\n---\nシステム指示に従い、改善した記事をJSONのみで返してください。`
          const rraw = await callLLM(REWRITE_SYSTEM, user)
          const rp = extractJson(rraw)
          const category = VALID_CATEGORIES.includes(rp.category) ? rp.category : a.category
          const tags = (Array.isArray(rp.industryTags) ? rp.industryTags : []).filter((t: string) => VALID_TAGS.includes(t))
          if (!rp.title || !rp.summary || !Array.isArray(rp.implications)) throw new Error("incomplete rewrite")
          base.revision = { title: rp.title, summary: rp.summary, implications: rp.implications, category, industryTags: tags }
        } catch (e) {
          base.rewriteFailed = true
          base.error = `rewrite failed: ${e instanceof Error ? e.message : String(e)}`
          console.warn(`      ! rewrite failed for ${a.id}: ${base.error}`)
        }
      }
    } catch (e) {
      base.verdict = "ERROR"
      base.error = e instanceof Error ? e.message : String(e)
      console.warn(`  [${i + 1}/${rows.length}] ERROR    ${a.title.slice(0, 40)} — ${base.error}`)
    }
    return base
  })

  const resultsPath = resolve(BACKUP_DIR, `results-${ts}.json`)
  writeFileSync(resultsPath, JSON.stringify(results, null, 2))

  const c = (v: string) => results.filter((r) => r.verdict === v).length
  console.log(`\n[evaluate] ===== summary =====`)
  console.log(`  PASS:     ${c("PASS")}`)
  console.log(`  REVISION: ${c("REVISION")}  (rewrite ok: ${results.filter((r) => r.verdict === "REVISION" && r.revision).length}, failed: ${results.filter((r) => r.verdict === "REVISION" && r.rewriteFailed).length})`)
  console.log(`  REJECT:   ${c("REJECT")}`)
  console.log(`  ERROR:    ${c("ERROR")}`)
  console.log(`\n[evaluate] REJECT list (will be DELETED on apply):`)
  for (const r of results.filter((r) => r.verdict === "REJECT")) {
    console.log(`  - ${r.id} | ${r.title}`)
    console.log(`      ${r.issues.join(" / ")}`)
  }
  console.log(`\n[evaluate] results written: ${resultsPath}`)
  console.log(`[evaluate] to apply: npx tsx scripts/cleanup-old-articles.ts apply ${resultsPath}`)
}

function storagePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}

async function apply(resultsFile: string) {
  const client = sb()
  const results: Result[] = JSON.parse(readFileSync(resolve(resultsFile), "utf8"))
  const now = new Date().toISOString()
  let pass = 0, revised = 0, flagged = 0, deleted = 0, imgDeleted = 0, skipped = 0

  for (const r of results) {
    if (r.verdict === "ERROR") {
      console.log(`SKIP   (eval error) ${r.id} ${r.title.slice(0, 40)}`)
      skipped++
      continue
    }

    if (r.verdict === "PASS") {
      const { error } = await client.from("articles").update({
        quality_verdict: "PASS",
        quality_notes: r.issues.join("\n") || null,
        revision_count: 0,
        last_quality_check_at: now,
      }).eq("id", r.id)
      if (error) { console.warn(`  ! PASS update failed ${r.id}: ${error.message}`); skipped++ } else pass++
      continue
    }

    if (r.verdict === "REVISION") {
      if (r.revision) {
        const { error } = await client.from("articles").update({
          title: r.revision.title,
          summary: r.revision.summary,
          implications: r.revision.implications,
          category: r.revision.category,
          industry_tags: r.revision.industryTags,
          quality_verdict: "REVISION",
          quality_notes: r.issues.join("\n") || null,
          revision_count: 1,
          last_quality_check_at: now,
        }).eq("id", r.id)
        if (error) { console.warn(`  ! REVISION update failed ${r.id}: ${error.message}`); skipped++ }
        else { console.log(`REVISE ${r.id} ${r.revision.title.slice(0, 40)}`); revised++ }
      } else {
        // rewrite failed → keep content, route to review for a human
        const { error } = await client.from("articles").update({
          workflow_status: "review",
          quality_verdict: "REVISION",
          quality_notes: (r.issues.join("\n") + "\n自動修正に失敗。要手動確認。").trim(),
          revision_count: 0,
          last_quality_check_at: now,
        }).eq("id", r.id)
        if (error) { console.warn(`  ! REVISION->review failed ${r.id}: ${error.message}`); skipped++ }
        else { console.log(`FLAG   (rewrite failed -> review) ${r.id}`); flagged++ }
      }
      continue
    }

    if (r.verdict === "REJECT") {
      if (r.image_url) {
        const p = storagePath(r.image_url)
        if (p) {
          const { error } = await client.storage.from(BUCKET).remove([p])
          if (error) console.warn(`  ! image delete failed ${r.id}: ${error.message}`)
          else imgDeleted++
        }
      }
      const { error } = await client.from("articles").delete().eq("id", r.id)
      if (error) { console.warn(`  ! delete failed ${r.id}: ${error.message}`); skipped++ }
      else { console.log(`DELETE ${r.id} ${r.title.slice(0, 40)}`); deleted++ }
      continue
    }
  }

  console.log(`\n[apply] ===== done =====`)
  console.log(`  PASS marked:        ${pass}`)
  console.log(`  REVISION rewritten: ${revised}`)
  console.log(`  flagged to review:  ${flagged}`)
  console.log(`  DELETED:            ${deleted} (images removed: ${imgDeleted})`)
  console.log(`  skipped:            ${skipped}`)
}

// ---- main ----
async function main() {
  const [, , cmd, arg] = process.argv
  if (cmd === "evaluate") {
    const li = process.argv.indexOf("--limit")
    await evaluate(li !== -1 ? Number(process.argv[li + 1]) : undefined)
  } else if (cmd === "apply") {
    if (!arg) { console.error("usage: apply <results.json>"); process.exit(1) }
    await apply(arg)
  } else {
    console.error("usage: cleanup-old-articles.ts evaluate [--limit N] | apply <results.json>")
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
