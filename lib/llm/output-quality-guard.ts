import type {
  QualityCheckOutput,
  QualityVerdict,
  SynthesisOutput,
  SynthesisSource,
} from "./types"
import { normalizeSourceTitle, normalizeSourceUrl } from "./source-policy.ts"

const MAX_ISSUES = 8
// 本文長の許容幅。狙いは約500〜620字だが、情報量の多い規制・通商記事は自然に長くなる。
// 厳密な560字上限だと公開水準の記事まで review に落ちていたため、ゲートの許容幅を広げる。
const ARTICLE_BODY_MIN_CHARS = 450
const ARTICLE_BODY_MAX_CHARS = 700
const TAKEAWAY_COUNT = 3
// 本記事のポイントは「読者が何が起きたか理解できる具体的な一文」(40〜90字目安)。
// ガードでは上限のみ機械判定し、羅列的な短文の検出は LLM 品質チェックに委ねる。
const TAKEAWAY_MAX_CHARS = 90
const SIGNIFICANT_NUMBER_MIN = 13
const GENERIC_KATAKANA_TERMS = new Set([
  "インド",
  "インフレ",
  "エネルギー",
  "ルピー",
  "ドル",
  "リスク",
  "コスト",
  "システム",
  "メーカー",
  "ディーラー",
  "パートナー",
  "タイムライン",
  "ベース",
  "サプライヤー",
  "サプライチェーン",
  "ヘッジ",
  "シナリオ",
  "セクター",
  "マーケット",
  "レート",
])

const META_COMMENTARY_PATTERNS = [
  /参考(?:記事|資料|リンク|文献)/,
  /原文を直接参照/,
  /本文(?:から)?取得できた事実/,
  /確認できないため(?:言及|断定)を控える/,
  /ソースで提供された情報/,
  /ソースに(?:明示|記載)されていない/,
]

const TEMPLATE_PHRASES = [
  "背景として、政策運用や現地実務の差分",
  "意思決定では、単一指標ではなく",
  "日本企業の実務では、導入スピードと運用安定性",
  "民間投資を誘発する構図が鮮明",
  "この構図は当面続くとみられる",
]

const INDUSTRY_TAG_KEYWORDS: Record<string, string[]> = {
  automotive: ["自動車", "乗用車", "二輪", "車両", "ev", "vehicle", "automotive"],
  semiconductor: ["半導体", "チップ", "semiconductor", "chip"],
  machine_tools: ["工作機械", "機械加工", "マシニング", "machine tool"],
  food: ["食品", "食料", "飲料", "農産", "food"],
  chemicals: ["化学", "化学品", "樹脂", "chemical"],
  logistics: ["物流", "配送", "倉庫", "サプライチェーン", "logistics", "delivery"],
  agriculture: ["農業", "農地", "農産", "agriculture", "farm"],
  steel: ["鉄鋼", "鋼材", "steel"],
  education: ["教育", "学校", "研修", "education", "school"],
  entertainment: ["映画", "音楽", "娯楽", "entertainment"],
  talent: ["人材", "採用", "労働", "雇用", "talent", "hiring"],
}

interface DeterministicIssue {
  issue: string
  instruction: string
  verdict?: QualityVerdict
}

export function runDeterministicQualityGuard(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): QualityCheckOutput | null {
  const issues: DeterministicIssue[] = [
    ...checkArticleFormat(output),
    ...checkMetaAndTemplateText(output),
    ...checkIndustryTagAlignment(output, cluster),
    ...checkReferenceMapping(output, cluster),
    ...checkUnsupportedNumbers(output, cluster),
    ...checkCurrencyConfusion(output),
    ...checkSourceUsageEvidence(output, cluster),
    ...checkImplicationIntroducesNewNames(output),
  ].slice(0, MAX_ISSUES)

  if (issues.length === 0) return null

  const verdict: QualityVerdict = issues.some((issue) => issue.verdict === "REJECT")
    ? "REJECT"
    : "REVISION"

  return {
    verdict,
    issues: issues.map((issue) => issue.issue),
    revisionInstructions: verdict === "REVISION"
      ? issues.map((issue) => `- ${issue.instruction}`).join("\n")
      : undefined,
  }
}

function checkArticleFormat(output: SynthesisOutput): DeterministicIssue[] {
  const issues: DeterministicIssue[] = []
  const bodyLength = output.summary.trim().length

  if (
    bodyLength < ARTICLE_BODY_MIN_CHARS ||
    bodyLength > ARTICLE_BODY_MAX_CHARS
  ) {
    issues.push({
      issue: `summary の文字数が指定範囲外である: ${bodyLength}字`,
      instruction: `summary は${ARTICLE_BODY_MIN_CHARS}〜${ARTICLE_BODY_MAX_CHARS}字程度に収めること。短すぎる場合は本文中の事実・背景を補い、長すぎる場合は重複や一般論を削ること。`,
    })
  }

  if (output.implications.length !== TAKEAWAY_COUNT) {
    issues.push({
      issue: `本記事のポイントが${TAKEAWAY_COUNT}件ではない: ${output.implications.length}件`,
      instruction: `implications は本記事のポイントとして${TAKEAWAY_COUNT}件ちょうど返すこと。`,
    })
  }

  output.implications.forEach((item, index) => {
    const length = item.trim().length
    if (length > TAKEAWAY_MAX_CHARS) {
      issues.push({
        issue: `本記事のポイント${index + 1}が${TAKEAWAY_MAX_CHARS}字を超えている: ${length}字`,
        instruction: `implications[${index}] は${TAKEAWAY_MAX_CHARS}字以内の具体的な一文に要約すること。`,
      })
    }
  })

  return issues
}

function checkMetaAndTemplateText(output: SynthesisOutput): DeterministicIssue[] {
  const text = outputText(output)
  const issues: DeterministicIssue[] = []

  if (META_COMMENTARY_PATTERNS.some((pattern) => pattern.test(text))) {
    issues.push({
      issue: "生成記事にソース不足や参考資料への言及などのメタ注釈が含まれている",
      instruction: "本文・まとめから『参考記事』『原文を直接参照』『確認できないため』などのメタ注釈を削除し、ソースで確認できる事実だけで記事を構成すること。根拠が足りない題材は生成しないこと。",
      verdict: "REJECT",
    })
  }

  const template = TEMPLATE_PHRASES.find((phrase) => text.includes(phrase))
  if (template) {
    issues.push({
      issue: `汎用テンプレート表現が残っている: ${template}`,
      instruction: "どの記事にも流用できる一般論・旧フィラー文を削除し、今回の参考記事で確認できる固有の事実に置き換えること。",
    })
  }

  return issues
}

function checkIndustryTagAlignment(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): DeterministicIssue[] {
  const text = `${outputText(output)}\n${allSourceText(cluster)}`.toLowerCase()
  const issues: DeterministicIssue[] = []

  for (const tag of output.industryTags) {
    const keywords = INDUSTRY_TAG_KEYWORDS[tag]
    if (!keywords) continue
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) continue
    issues.push({
      issue: `industryTags に記事内容と整合しないタグが含まれている: ${tag}`,
      instruction: `industryTags から「${tag}」を削除し、対応する業界が本文・参考記事で明確に扱われているタグだけを残すこと。該当する許可タグがない場合は空配列でよい。`,
    })
  }

  return issues
}

function outputText(output: SynthesisOutput): string {
  // 背景・日本企業への影響も本文同様に「参照資料の事実のみ」が要件なので、
  // メタ注釈・数値捏造・通貨混同チェックの対象に含める。キーワード定義は
  // 公的資料由来の正式名称等を含み得るため数値照合の誤検知源になりやすく、対象外。
  return [
    output.title,
    output.summary,
    ...output.implications,
    output.backgroundContext ?? "",
    output.japanBusinessImpact ?? "",
    output.indiaRelevance.reason,
    output.japaneseBusinessRelevance.reason,
  ].join("\n")
}

function sourceText(source: SynthesisSource): string {
  return [
    source.title,
    source.publishedAt,
    source.bodyText,
  ].join("\n")
}

function allSourceText(cluster: SynthesisSource[]): string {
  return cluster.map(sourceText).join("\n")
}

function checkReferenceMapping(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): DeterministicIssue[] {
  const issues: DeterministicIssue[] = []
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()

  for (const reference of output.referenceUrls) {
    const urlKey = normalizeSourceUrl(reference.url)
    const titleKey = normalizeSourceTitle(reference.title)
    if (seenUrls.has(urlKey) || seenTitles.has(titleKey)) {
      issues.push({
        issue: `referenceUrls に同一記事の重複が残っている: ${reference.title}`,
        instruction: "referenceUrls から同一URL・同一タイトル・転載・Google Newsリダイレクトの重複を削除し、本文で使った原文記事だけを残すこと。",
      })
      continue
    }
    seenUrls.add(urlKey)
    seenTitles.add(titleKey)

    const sourceIndex = cluster.findIndex(
      (source) =>
        normalizeSourceUrl(source.sourceUrl) === urlKey ||
        normalizeSourceTitle(source.title) === titleKey,
    )
    if (sourceIndex < 0) {
      issues.push({
        issue: `referenceUrls に入力クラスタと対応しない記事が含まれている: ${reference.title}`,
        instruction: "referenceUrls は今回入力された参考記事から、本文で実際に使ったものだけに限定すること。",
      })
      continue
    }

    const hasUsage = output.sourceUsage?.some(
      (usage) => usage.sourceIndex === sourceIndex + 1 && usage.factsUsed.length > 0,
    )
    if (!hasUsage) {
      issues.push({
        issue: `referenceUrls の記事が sourceUsage で使用事実を説明していない: 参考記事${sourceIndex + 1}`,
        instruction: "本文で使っていない参考記事は referenceUrls から外すこと。残す場合は sourceUsage に、その記事だけから採用した具体的事実を記載すること。",
      })
    }
  }

  return issues
}

function checkUnsupportedNumbers(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): DeterministicIssue[] {
  const sourceNumbers = extractNumbers(allSourceText(cluster))
  const issues: DeterministicIssue[] = []
  for (const number of extractNumbers(outputText(output))) {
    // 西暦(1900〜2099)は捏造データではなく文脈表現として使われるため対象外にする。
    if (/^(?:19|20)\d{2}$/.test(number.normalized)) continue
    if (isSupportedNumber(number, sourceNumbers)) continue
    issues.push({
      issue: `参考記事本文にない数値が生成記事に含まれている: ${number.raw}`,
      instruction: `数値「${number.raw}」は参考記事本文で確認できないため削除するか、参考記事本文に明記された数値だけで書き直すこと。一般知識・推測・外部記憶で数値を補わないこと。`,
    })
  }
  return issues
}

function checkCurrencyConfusion(output: SynthesisOutput): DeterministicIssue[] {
  const text = outputText(output)
  if (!text.includes("ルピー") || !/[0-9０-９]+(?:\.[0-9０-９]+)?円台/.test(text)) {
    return []
  }
  return [{
    issue: "ルピー相場の記事で『円台』という通貨単位の混同がある",
    instruction: "為替水準がルピー建てなら『94ルピー台』のように書き、『円台』表現を使わないこと。",
  }]
}

function checkSourceUsageEvidence(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): DeterministicIssue[] {
  const issues: DeterministicIssue[] = []
  const articleText = outputText(output)
  const flaggedUnusedSources = new Set<number>()

  for (const usage of output.sourceUsage ?? []) {
    const source = cluster[usage.sourceIndex - 1]
    if (!source) {
      issues.push({
        issue: `sourceUsage が存在しない参考記事番号を指している: ${usage.sourceIndex}`,
        instruction: "sourceUsage の sourceIndex は入力された参考記事番号だけを使うこと。",
      })
      continue
    }

    const sourceNumbers = extractNumbers(sourceText(source))
    for (const fact of usage.factsUsed) {
      const factNumbers = extractNumbers(fact)
      for (const number of factNumbers) {
        if (!isSupportedNumber(number, sourceNumbers)) {
          issues.push({
            issue: `sourceUsage の事実に、該当参考記事で確認できない数値が含まれている: 参考記事${usage.sourceIndex} / ${number.raw}`,
            instruction: `sourceUsage と本文から、参考記事${usage.sourceIndex}で確認できない数値「${number.raw}」を削除すること。`,
          })
        }
      }

      const factEvidenceTokens = [
        ...factNumbers.map((number) => number.normalized),
      ]
      if (
        factEvidenceTokens.length > 0 &&
        !factEvidenceTokens.some((token) => articleText.toLowerCase().includes(token.toLowerCase())) &&
        !flaggedUnusedSources.has(usage.sourceIndex)
      ) {
        flaggedUnusedSources.add(usage.sourceIndex)
        issues.push({
          issue: `sourceUsage の事実が生成本文で実質的に使われていない: 参考記事${usage.sourceIndex}`,
          instruction: `本文で使っていない参考記事${usage.sourceIndex}は sourceUsage と referenceUrls から外すこと。使う場合は、factsUsed に書いた数値・事実を本文中に明確に反映し、factsUsed は本文と同じ表記で書くこと。`,
        })
      }
    }
  }

  return issues
}

function checkImplicationIntroducesNewNames(output: SynthesisOutput): DeterministicIssue[] {
  const body = `${output.title}\n${output.summary}`
  const newNames = output.implications
    .flatMap((implication) => extractJapaneseNameLikeTerms(implication))
    .filter((term) => !body.includes(term))

  if (newNames.length === 0) return []

  return [{
    issue: `implications で本文に出ていない固有名詞・具体名が突然出ている: ${newNames.slice(0, 3).join(", ")}`,
    instruction: `示唆で使う具体名(${newNames.slice(0, 3).join(", ")})は本文で先に説明するか、本文と接続できないなら示唆から削除すること。`,
  }]
}

interface ExtractedNumber {
  raw: string
  normalized: string
}

function extractNumbers(text: string): ExtractedNumber[] {
  const result: ExtractedNumber[] = []
  const seen = new Set<string>()
  const normalizedText = text.normalize("NFKC")
  const matches = normalizedText.matchAll(/\d[\d,]*(?:\.\d+)?/g)

  for (const match of matches) {
    const raw = match[0]
    const normalized = raw.replace(/,/g, "")
    const numeric = Number(normalized)
    if (!Number.isFinite(numeric)) continue
    const suffix = normalizedText.slice(match.index + raw.length, match.index + raw.length + 6)
    const hasSensitiveUnit = /^[\s　]*(?:%|％|パーセント|クロール|億|兆|万人|社|件|基点|ポイント)/.test(suffix)
    if (numeric > 0 && numeric < SIGNIFICANT_NUMBER_MIN && !hasSensitiveUnit) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push({ raw, normalized })
  }

  return result
}

function isSupportedNumber(
  number: ExtractedNumber,
  sourceNumbers: ExtractedNumber[],
): boolean {
  return sourceNumbers.some((sourceNumber) => {
    if (sourceNumber.normalized === number.normalized) return true
    return (
      !number.normalized.includes(".") &&
      sourceNumber.normalized.startsWith(`${number.normalized}.`)
    )
  })
}

// このチェックは「まとめが本文にない固有名詞を突然導入していないか」を高精度に拾うのが目的。
// 単独のカタカナ語(システム/パートナー/ベース 等)や単独の略語は汎用語との区別がつかず誤検知の温床
// だったため、明らかに固有名詞の構造を持つものだけを対象にする:
//   - カタカナは「・」で連結された複合名(例: マルチ・スズキ)のみ。ただし全パートが汎用語なら除外。
//   - ラテン文字は複数語の固有名(例: Tata Communications)のみ。単独語・単独略語は対象外。
// 曖昧な固有名詞判定は LLM 品質チェック側(quality-prompts.ts)に委ねる。
function extractJapaneseNameLikeTerms(text: string): string[] {
  const katakanaNames = [...text.matchAll(/[ァ-ヴー]{2,}(?:・[ァ-ヴー]{2,})+/g)].map((m) => m[0])
  const latinNames = [...text.matchAll(/[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*)+/g)].map((m) => m[0])

  const result: string[] = []
  for (const term of new Set([...katakanaNames, ...latinNames])) {
    if (term.length < 3) continue
    if (GENERIC_KATAKANA_TERMS.has(term)) continue
    // 「・」連結でも全パートが汎用語なら固有名詞ではない(例: インフレ・エネルギー)
    if (term.includes("・") && term.split("・").every((part) => GENERIC_KATAKANA_TERMS.has(part))) {
      continue
    }
    result.push(term)
  }
  return result
}
