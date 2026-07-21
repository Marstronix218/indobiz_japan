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
const ARTICLE_BODY_MIN_CHARS = 430
const ARTICLE_BODY_MAX_CHARS = 750
const TAKEAWAY_COUNT = 3
// 本記事のポイントは「読者が何が起きたか理解できる具体的な一文」(40〜90字目安)。
// 極端な短文と長文は機械判定し、内容の具体性は LLM 品質チェックに委ねる。
const TAKEAWAY_MIN_CHARS = 40
const TAKEAWAY_MAX_CHARS = 90
// Both explanatory cards target 180–220 characters. The guard keeps a slightly
// wider acceptance band to prevent needless revision churn, then checks their
// relative length separately so the two cards carry comparable detail.
const ENRICHMENT_SECTION_MIN_CHARS = 150
const ENRICHMENT_SECTION_MAX_CHARS = 250
const ENRICHMENT_SECTION_MAX_LENGTH_DIFFERENCE = 50
const KEYWORD_DEFINITION_MIN_CHARS = 40
const KEYWORD_DEFINITION_MAX_CHARS = 130
const IMAGE_CAPTION_MIN_CHARS = 40
const IMAGE_CAPTION_MAX_CHARS = 90
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
  energy: [
    "原油",
    "石油",
    "エネルギー",
    "電力",
    "天然ガス",
    "lng",
    "crude",
    "petroleum",
    "energy",
    "electricity",
  ],
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
    ...checkEnrichmentFormat(output),
    ...checkMetaAndTemplateText(output),
    ...checkIndustryTagAlignment(output, cluster),
    ...checkReferenceMapping(output, cluster),
    ...checkEventStatusFidelity(output, cluster),
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

function checkEventStatusFidelity(
  output: SynthesisOutput,
  cluster: SynthesisSource[],
): DeterministicIssue[] {
  const sources = allSourceText(cluster)
  const issues: DeterministicIssue[] = []
  // A word such as "draft" can appear in an unrelated annex or historical
  // document on trade/economy pages. Apply the strict status-preservation gate
  // to regulation articles, or whenever a source headline itself identifies
  // the item as draft/proposed/under consultation.
  const draftStatusPattern = /\b(?:draft|proposed)\b|public comments?|public consultation|consultation paper|exposure draft|草案|意見募集|パブリックコメント/i
  const draftInSources = output.category === "regulation"
    ? draftStatusPattern.test(sources)
    : cluster.some((source) => draftStatusPattern.test(source.title))
  const draftMarker = /案|草案|提案|意見募集|パブリックコメント|協議中|検討中|draft|proposed/i

  if (draftInSources && (!draftMarker.test(output.title) || !draftMarker.test(output.summary))) {
    issues.push({
      issue: "参考資料では草案・提案・意見募集段階だが、タイトルまたは本文がその法的状態を明示していない",
      instruction: "タイトルとsummaryの両方で『草案』『案を公表』『意見募集』など現在の状態を明示し、草案中のshall/mustを確定済みの義務・施行済みルールとして書かないこと。",
    })
  }

  const futureEffectiveInSources = /will (?:enter|come) into force|will take effect|scheduled to (?:enter|come) into force|発効予定|施行予定/i.test(sources)
  const effectiveConfirmedInSources = /(?:has )?(?:entered|came) into force|took effect|is now in force|発効した|発効済み|施行された/i.test(sources)
  const outputClaimsEffective = /発効(?:した|し(?:、|ている)|済み)|施行(?:された|し(?:、|ている)|済み)|効力を生じた/.test(
    `${output.title}\n${output.summary}`,
  )
  if (futureEffectiveInSources && !effectiveConfirmedInSources && outputClaimsEffective) {
    issues.push({
      issue: "参考資料では将来の発効・施行予定だが、生成記事が発効・施行済みとしている",
      instruction: "参考資料の基準日時点に合わせて『発効予定』『施行予定』と書くこと。発効済みとする場合は、発効を確認できる新しい一次資料を入力ソースに追加すること。",
    })
  }

  return issues
}

function checkEnrichmentFormat(output: SynthesisOutput): DeterministicIssue[] {
  const issues: DeterministicIssue[] = []
  const hasConciseNoDirectImpact = Boolean(
    output.japanBusinessImpact &&
      /日本企業への直接的な影響.*確認でき(?:ません|ない)/.test(
        output.japanBusinessImpact,
      ) &&
      output.japanBusinessImpact.length <= ENRICHMENT_SECTION_MAX_CHARS,
  )

  const checkOptionalLength = (
    label: string,
    field: string,
    value: string | undefined,
    min: number,
    max: number,
  ) => {
    if (!value) return
    const length = value.trim().length
    if (length >= min && length <= max) return
    issues.push({
      issue: `${label}の文字数が指定範囲外である: ${length}字`,
      instruction: `${field} は${min}〜${max}字に収めること。参照資料で確認できる事実だけを使い、根拠が足りなければ null にすること。`,
    })
  }

  checkOptionalLength(
    "ニュースの背景",
    "backgroundContext",
    output.backgroundContext,
    ENRICHMENT_SECTION_MIN_CHARS,
    ENRICHMENT_SECTION_MAX_CHARS,
  )
  checkOptionalLength(
    "日本企業への影響",
    "japanBusinessImpact",
    hasConciseNoDirectImpact ? undefined : output.japanBusinessImpact,
    ENRICHMENT_SECTION_MIN_CHARS,
    ENRICHMENT_SECTION_MAX_CHARS,
  )

  if (
    output.backgroundContext &&
    output.japanBusinessImpact &&
    !hasConciseNoDirectImpact
  ) {
    const difference = Math.abs(
      output.backgroundContext.trim().length -
        output.japanBusinessImpact.trim().length,
    )
    if (difference > ENRICHMENT_SECTION_MAX_LENGTH_DIFFERENCE) {
      issues.push({
        issue: `ニュースの背景と日本企業への影響の文字数差が大きい: ${difference}字差`,
        instruction: `backgroundContext と japanBusinessImpact の文字数差を${ENRICHMENT_SECTION_MAX_LENGTH_DIFFERENCE}字以内にし、両セクションの情報量をおおむね揃えること。`,
      })
    }
  }
  checkOptionalLength(
    "画像キャプション",
    "imageCaption",
    output.imageCaption,
    IMAGE_CAPTION_MIN_CHARS,
    IMAGE_CAPTION_MAX_CHARS,
  )

  for (const [index, keyword] of (output.keywords ?? []).entries()) {
    const length = keyword.definition.trim().length
    if (
      length >= KEYWORD_DEFINITION_MIN_CHARS &&
      length <= KEYWORD_DEFINITION_MAX_CHARS
    ) {
      continue
    }
    issues.push({
      issue: `キーワード解説${index + 1}（${keyword.term}）の説明が指定範囲外である: ${length}字`,
      instruction: `keywords[${index}].definition は${KEYWORD_DEFINITION_MIN_CHARS}〜${KEYWORD_DEFINITION_MAX_CHARS}字で、参照資料から確認できる定義だけを書くこと。根拠が足りなければその用語を削除すること。`,
    })
  }

  return issues
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
    if (length < TAKEAWAY_MIN_CHARS || length > TAKEAWAY_MAX_CHARS) {
      issues.push({
        issue: `本記事のポイント${index + 1}が指定範囲外である: ${length}字`,
        instruction: `implications[${index}] は${TAKEAWAY_MIN_CHARS}〜${TAKEAWAY_MAX_CHARS}字の具体的な一文にすること。`,
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
    if (!keywords) {
      issues.push({
        issue: `industryTags に許可されていないタグが含まれている: ${tag}`,
        instruction: `industryTags から「${tag}」を削除し、プロンプトで許可されたタグだけを使うこと。該当する許可タグがない場合は空配列にすること。`,
      })
      continue
    }
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
  const articleNumbers = extractNumbers(articleText)
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

      if (
        factNumbers.length > 0 &&
        !factNumbers.some((number) => isSupportedNumber(number, articleNumbers)) &&
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
  numeric: number
  scale: number
  kind: "generic" | "currency" | "count" | "percent"
}

const JAPANESE_SCALE_UNITS: Record<string, number> = {
  "兆": 1_000_000_000_000,
  "億": 100_000_000,
  "万": 10_000,
  "千": 1_000,
}

// 日本語の複合数詞(例: 892億4000万)は1つの数値として読む。桁ごとに「892」「4000」と
// 切り出すと、原文の "Rs 8,924 crore" と突き合わせられず、正しい換算値が捏造として
// 弾かれる。これが数値チェック誤検知の最大の原因だった。
const COMPOUND_JAPANESE_NUMBER = String.raw`(?:\d[\d,]*(?:\.\d+)?\s*[兆億万千]\s*)+(?:\d[\d,]*(?:\.\d+)?)?`
const PLAIN_NUMBER = String.raw`\d[\d,]*(?:\.\d+)?`
const NUMBER_TOKEN_PATTERN = new RegExp(
  `${COMPOUND_JAPANESE_NUMBER}|${PLAIN_NUMBER}`,
  "g",
)
// 「60-80 billion」「$60 to $80 billion」「6.6〜6.8%」のような範囲表記の
// 左側の数値。2つ目の値の直前に通貨記号・通貨コードが繰り返される表記も許容する。
const RANGE_SEPARATOR = /^\s*(?:[-–—〜~]|to|and)\s*(?:[$₹]|(?:rs\.?|inr|usd)\s*)?$/i

function numberUnit(
  prefix: string,
  suffix: string,
): Pick<ExtractedNumber, "scale" | "kind"> {
  const around = `${prefix}__NUMBER__${suffix}`
  const isCurrency = /(?:₹|\$|rs\.?|inr|usd|dollars?|ルピー|円|ドル)/i.test(around)
  // 助数詞は数値の直後になければならない。18字の先読み窓のどこかに「社」があれば
  // 件数、という判定だと「41億ドル)だった。小売子会社…」の 41億 が通貨ではなく件数に
  // 分類され、原文の "$4.1 billion" と kind 不一致で捏造扱いになっていた。
  const isCount =
    /^[\s　]*(?:人|社|件|台|基)/.test(suffix) ||
    /^[\s　]*(?:(?:lakh|crore|million|billion|thousand)s?\s+)?(?:people|persons?|workers?|employees?|jobs?|units?)\b/i
      .test(suffix)
  const isPercent = /^[\s\-–—]*(?:%|％|パーセント|per\s*cent|percent|ppt|percentage points?)/i.test(suffix)
  // 「Rs 8,924-crore package」のようにハイフンで単位が続く表記も拾う。
  const unitPrefix = String.raw`^[\s\-–—]*`
  const has = (pattern: string) => new RegExp(`${unitPrefix}${pattern}`, "i").test(suffix)

  if (has(String.raw`lakh\s+crores?`)) {
    return { scale: 1_000_000_000_000, kind: isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`(?:crores?|crs?\b|クロール)`)) {
    return { scale: 10_000_000, kind: isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`lakhs?`)) {
    return { scale: 100_000, kind: isCount ? "count" : isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`(?:trillions?|tn\b)`)) {
    return { scale: 1_000_000_000_000, kind: isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`(?:billions?|bn\b)`)) {
    return { scale: 1_000_000_000, kind: isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`(?:millions?|mn\b)`)) {
    return { scale: 1_000_000, kind: isCurrency ? "currency" : "generic" }
  }
  if (has(String.raw`(?:thousands?|k\b)`)) {
    return { scale: 1_000, kind: isCount ? "count" : isCurrency ? "currency" : "generic" }
  }
  if (isPercent) return { scale: 1, kind: "percent" }
  if (isCount) return { scale: 1, kind: "count" }
  if (isCurrency) return { scale: 1, kind: "currency" }
  return { scale: 1, kind: "generic" }
}

// 「892億4000万」→ 89,240,000,000。単位語のない末尾の桁はそのまま加算する。
function parseCompoundJapaneseNumber(token: string): number | null {
  let total = 0
  let matched = false
  for (const part of token.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*([兆億万千])?/g)) {
    const value = Number(part[1].replace(/,/g, ""))
    if (!Number.isFinite(value)) return null
    total += part[2] ? value * JAPANESE_SCALE_UNITS[part[2]] : value
    matched = true
  }
  return matched ? total : null
}

interface PositionedNumber extends ExtractedNumber {
  index: number
  end: number
}

function extractNumbers(text: string): ExtractedNumber[] {
  const normalizedText = text.normalize("NFKC")
  const candidates: PositionedNumber[] = []

  for (const match of normalizedText.matchAll(NUMBER_TOKEN_PATTERN)) {
    const raw = match[0]
    const index = match.index
    const end = index + raw.length
    const prefix = normalizedText.slice(Math.max(0, index - 8), index)
    const suffix = normalizedText.slice(end, end + 18)
    const unit = numberUnit(prefix, suffix)

    if (/[兆億万千]/.test(raw)) {
      // 複合数詞はトークン内で絶対値まで解決済みなので、後続の単位語で再スケールしない。
      const numeric = parseCompoundJapaneseNumber(raw)
      if (numeric === null) continue
      candidates.push({
        raw,
        normalized: String(numeric),
        numeric,
        scale: 1,
        kind: unit.kind,
        index,
        end,
      })
      continue
    }

    const normalized = raw.replace(/,/g, "")
    const numeric = Number(normalized)
    if (!Number.isFinite(numeric)) continue
    candidates.push({ raw, normalized, numeric, ...unit, index, end })
  }

  // 範囲表記の左側は単位語が右側にしか付かない(例: "$60-80 billion" の 60)。
  // 単位を引き継がないと 60 が裸の 60 として残り、生成側の「600億ドル」と
  // 突き合わせられずに捏造扱いになる。
  for (let i = candidates.length - 2; i >= 0; i--) {
    const current = candidates[i]
    const next = candidates[i + 1]
    if (current.scale !== 1 || next.scale === 1) continue
    if (!RANGE_SEPARATOR.test(normalizedText.slice(current.end, next.index))) continue
    current.scale = next.scale
    if (current.kind === "generic") current.kind = next.kind
  }

  const result: ExtractedNumber[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    const suffix = normalizedText.slice(candidate.end, candidate.end + 18)
    // Keep small values when they carry a meaningful unit. Previously the
    // early filter only recognised Japanese "%" spellings, so an English
    // source value such as "5.2 per cent" disappeared before unit
    // normalisation while the generated Japanese "5.2%" remained. That made
    // supported percentages look fabricated.
    const hasSensitiveUnit = candidate.kind === "percent" || candidate.scale !== 1 ||
      /[兆億万千]/.test(candidate.raw) ||
      /^[\s　\-–—]*(?:%|％|パーセント|per\s*cent|percent|クロール|crores?|lakhs?|億|兆|万人|社|件|基点|ポイント)/i.test(suffix)
    if (candidate.numeric > 0 && candidate.numeric < SIGNIFICANT_NUMBER_MIN && !hasSensitiveUnit) {
      continue
    }
    const key = `${candidate.normalized}|${candidate.scale}|${candidate.kind}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      raw: candidate.raw,
      normalized: candidate.normalized,
      numeric: candidate.numeric,
      scale: candidate.scale,
      kind: candidate.kind,
    })
  }

  return result
}

function isSupportedNumber(
  number: ExtractedNumber,
  sourceNumbers: ExtractedNumber[],
): boolean {
  return sourceNumbers.some((sourceNumber) => {
    const compatibleKind =
      sourceNumber.kind === number.kind ||
      sourceNumber.kind === "generic" ||
      number.kind === "generic"
    if (!compatibleKind) return false
    if (
      sourceNumber.normalized === number.normalized &&
      sourceNumber.scale === number.scale
    ) return true
    if (
      number.scale === 1 &&
      sourceNumber.scale === 1 &&
      !number.normalized.includes(".") &&
      sourceNumber.normalized.startsWith(`${number.normalized}.`)
    ) return true

    const generatedCanonical = number.numeric * number.scale
    const sourceCanonical = sourceNumber.numeric * sourceNumber.scale
    if (!Number.isFinite(generatedCanonical) || !Number.isFinite(sourceCanonical)) {
      return false
    }
    const denominator = Math.max(Math.abs(generatedCanonical), Math.abs(sourceCanonical), 1)
    // Converted Japanese notation is sometimes rounded at a Japanese scale
    // boundary (e.g. Rs 8,924 crore → 約892億ルピー, 32,641,704 people →
    // 約3,264万人). Apply the wider tolerance only when either side actually
    // uses 兆/億/万/千. Exact counts and percentages must not drift merely
    // because currency display rounding is allowed (e.g. 200人 → 201人).
    const usesJapaneseDisplayScale = /[兆億万千]/.test(number.raw) ||
      /[兆億万千]/.test(sourceNumber.raw)
    const tolerance = usesJapaneseDisplayScale ? 0.005 : 0.0005
    return Math.abs(generatedCanonical - sourceCanonical) / denominator <= tolerance
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
