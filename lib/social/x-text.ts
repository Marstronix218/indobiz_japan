/**
 * X(旧Twitter)投稿文の組み立てと文字数計算。純粋関数のみ(テスト: x-text.test.ts)。
 *
 * Xの上限は「重み付き」280。twitter-text v3 の規則に合わせ、
 * ラテン文字など一部の範囲は1、それ以外(日本語・絵文字など)は2、
 * URLは長さに関係なく t.co 短縮後の23として数える。
 */

export const X_MAX_WEIGHTED_LENGTH = 280
export const X_URL_WEIGHT = 23

/** twitter-text v3 で重み1になるコードポイント範囲。 */
const LIGHT_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0000, 0x10ff],
  [0x2000, 0x200d],
  [0x2010, 0x201f],
  [0x2032, 0x2037],
]

function charWeight(codePoint: number): number {
  for (const [start, end] of LIGHT_RANGES) {
    if (codePoint >= start && codePoint <= end) return 1
  }
  return 2
}

const URL_PATTERN = /https?:\/\/[^\s]+/g

/**
 * Xの重み付き文字数。絵文字の結合シーケンスはXでは2だが、ここでは
 * コードポイントごとに数えるので多めに出る(上限超過を起こさない側に倒れる)。
 */
export function xWeightedLength(text: string): number {
  const normalized = text.normalize("NFC")
  let total = 0
  let lastIndex = 0
  for (const match of normalized.matchAll(URL_PATTERN)) {
    total += plainWeight(normalized.slice(lastIndex, match.index))
    total += X_URL_WEIGHT
    lastIndex = (match.index ?? 0) + match[0].length
  }
  total += plainWeight(normalized.slice(lastIndex))
  return total
}

function plainWeight(text: string): number {
  let total = 0
  for (const char of text) total += charWeight(char.codePointAt(0) ?? 0)
  return total
}

/** 重み付きで `maxWeight` 以内に収まるよう末尾を「…」で切る。 */
export function truncateToWeight(text: string, maxWeight: number): string {
  if (plainWeight(text) <= maxWeight) return text
  const ellipsis = "…"
  const budget = maxWeight - plainWeight(ellipsis)
  if (budget <= 0) return ""
  let used = 0
  let out = ""
  for (const char of text) {
    const w = charWeight(char.codePointAt(0) ?? 0)
    if (used + w > budget) break
    used += w
    out += char
  }
  return out.trimEnd() + ellipsis
}

export interface XPostInput {
  title: string
  /** 表示用カテゴリ名(例: "経済")。 */
  categoryLabel?: string
  /** 本記事のポイントなど、見出しの次に添える一文。無ければ省略。 */
  lead?: string
  /** 記事の絶対URL。 */
  url: string
  hashtags?: readonly string[]
}

export const DEFAULT_X_HASHTAGS = ["#インド", "#インドビジネス"] as const

/**
 * 投稿文を組み立てる。見出し・URL・ハッシュタグは必ず残し、
 * 文字数が足りないときは lead → 見出しの順に短くする。
 *
 *   【経済】見出し
 *
 *   ポイント
 *
 *   #インド #インドビジネス
 *   https://...
 */
export function composeXPost(input: XPostInput): string {
  const hashtags = (input.hashtags ?? DEFAULT_X_HASHTAGS).join(" ")
  const prefix = input.categoryLabel ? `【${input.categoryLabel}】` : ""
  const tail = [hashtags, input.url].filter(Boolean).join("\n")

  const build = (title: string, lead: string) =>
    [`${prefix}${title}`, lead, tail].filter(Boolean).join("\n\n")

  const title = input.title.trim()
  const lead = (input.lead ?? "").trim().replace(/\s+/g, " ")

  const full = build(title, lead)
  if (xWeightedLength(full) <= X_MAX_WEIGHTED_LENGTH) return full

  // lead を残り枠に合わせて切る。短くなりすぎるなら丸ごと落とす。
  const withoutLead = build(title, "")
  const leadBudget = X_MAX_WEIGHTED_LENGTH - xWeightedLength(withoutLead) - 2 // "\n\n"
  const MIN_LEAD_WEIGHT = 40
  if (lead && leadBudget >= MIN_LEAD_WEIGHT) {
    return build(title, truncateToWeight(lead, leadBudget))
  }
  if (xWeightedLength(withoutLead) <= X_MAX_WEIGHTED_LENGTH) return withoutLead

  // 見出しだけで溢れる極端なケース。
  const titleBudget =
    X_MAX_WEIGHTED_LENGTH - xWeightedLength(tail) - 2 /* "\n\n" */ - plainWeight(prefix)
  return build(truncateToWeight(title, titleBudget), "")
}

/** 日本時間の日付(YYYY-MM-DD)。1日1投稿の判定キーに使う。 */
export function jstDateKey(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}
