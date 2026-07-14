import type {
  IndiaRelevance,
  JapaneseBusinessRelevance,
  ReferenceUrl,
  SourceUsage,
  SynthesisOutput,
} from "./types"
import { LLMError } from "./types"
import type { SynthesisInput, SynthesisKeyword } from "./types"
import { sanitizeReferenceUrls } from "./source-policy"
import { sanitizeArticleKeywords } from "@/lib/news-data"

// 理解補助セクションの許容上限。目安(背景200〜300字/影響100〜180字/キャプション
// 40〜90字)から大きく外れた異常出力は、切り詰めではなく undefined に落とす
// (中途半端に切ると文が壊れるため。本文の保存は新フィールドの失敗で止めない)。
const BACKGROUND_MAX_CHARS = 600
const IMPACT_MAX_CHARS = 400
const CAPTION_MAX_CHARS = 200

export function extractJsonObject(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    if (inner.startsWith("{") && inner.endsWith("}")) return inner
  }

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  throw new LLMError("LLM応答にJSONオブジェクトが見つかりません")
}

export function parseSynthesisOutput(raw: string, input?: SynthesisInput): SynthesisOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (error) {
    throw new LLMError("LLM応答のJSONパースに失敗", error)
  }

  if (!parsed || typeof parsed !== "object") {
    throw new LLMError("LLM応答がオブジェクトではありません")
  }

  const obj = parsed as Record<string, unknown>
  const title = asString(obj.title)
  const summary = asString(obj.summary)
  // `implications` はDB互換のフィールド名だが、現在は記事冒頭に出す
  // 「本記事のまとめ」3件として扱う。過剰に返った場合だけ先頭3件に絞る。
  const implications = asStringArray(obj.implications).slice(0, 3)
  const industryTags = asStringArray(obj.industryTags ?? [])
  const category = asString(obj.category)
  const sourceUsage = asSourceUsage(obj.sourceUsage)
  const referenceUrls = sanitizeReferenceUrls(
    asReferenceUrls(obj.referenceUrls),
    input,
    sourceUsage,
  )
  const indiaRelevance = asIndiaRelevance(obj.indiaRelevance)
  const japaneseBusinessRelevance = asJapaneseBusinessRelevance(
    obj.japaneseBusinessRelevance,
  )
  const imagePrompt = asString(obj.imagePrompt) || title
  const backgroundContext = asBoundedText(obj.backgroundContext, BACKGROUND_MAX_CHARS)
  const japanBusinessImpact = asBoundedText(obj.japanBusinessImpact, IMPACT_MAX_CHARS)
  const keywords = asKeywords(obj.keywords)
  const imageCaption = asBoundedText(obj.imageCaption, CAPTION_MAX_CHARS)

  if (!title || !summary || implications.length === 0 || !category) {
    throw new LLMError("LLM応答に必須フィールドが欠落しています")
  }

  return {
    title,
    summary,
    implications,
    industryTags,
    category,
    referenceUrls,
    sourceUsage,
    indiaRelevance,
    japaneseBusinessRelevance,
    imagePrompt,
    backgroundContext,
    japanBusinessImpact,
    keywords,
    imageCaption,
  }
}

// 任意テキストフィールド用: 文字列以外・空文字・上限超過はすべて undefined に
// フォールバックし、既存フローを一切止めない。
function asBoundedText(value: unknown, maxChars: number): string | undefined {
  const text = asString(value)
  if (!text || text.length > maxChars) return undefined
  return text
}

function asKeywords(value: unknown): SynthesisKeyword[] | undefined {
  // 件数上限(4件)・必須項目・文字数上限の検証は保存側と共通のサニタイザに委ねる。
  const keywords = sanitizeArticleKeywords(value)
  return keywords.length > 0 ? keywords : undefined
}

function asReferenceUrls(value: unknown): ReferenceUrl[] {
  const fromLLM: ReferenceUrl[] = []
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue
      const obj = item as Record<string, unknown>
      const title = asString(obj.title)
      const url = asString(obj.url)
      if (title && url) fromLLM.push({ title, url })
    }
  }
  return fromLLM
}

function asSourceUsage(value: unknown): SourceUsage[] {
  if (!Array.isArray(value)) return []
  const result: SourceUsage[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const obj = item as Record<string, unknown>
    const sourceIndex = Number(obj.sourceIndex)
    const factsUsed = asStringArray(obj.factsUsed)
    if (Number.isInteger(sourceIndex) && sourceIndex > 0 && factsUsed.length > 0) {
      result.push({ sourceIndex, factsUsed })
    }
  }
  return result
}

function asIndiaRelevance(value: unknown): IndiaRelevance {
  if (!value || typeof value !== "object") {
    return { score: 2, reason: "indiaRelevance未指定のため既定値で扱う" }
  }
  const obj = value as Record<string, unknown>
  const rawScore = typeof obj.score === "number" ? obj.score : Number(obj.score)
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(3, Math.round(rawScore))) : 2
  const reason = asString(obj.reason) || "判定理由なし"
  return { score: score as IndiaRelevance["score"], reason }
}

function asJapaneseBusinessRelevance(
  value: unknown,
): JapaneseBusinessRelevance {
  if (!value || typeof value !== "object") {
    return {
      score: 2,
      reason: "japaneseBusinessRelevance未指定のため既定値で扱う",
    }
  }
  const obj = value as Record<string, unknown>
  const rawScore = typeof obj.score === "number" ? obj.score : Number(obj.score)
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(3, Math.round(rawScore)))
    : 2
  const reason = asString(obj.reason) || "判定理由なし"
  return {
    score: score as JapaneseBusinessRelevance["score"],
    reason,
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean)
}
