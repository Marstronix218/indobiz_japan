import type {
  QualityCheckOutput,
  QualityVerdict,
  SynthesisOutput,
  SynthesisSource,
} from "./types"
import { normalizeSourceTitle, normalizeSourceUrl } from "./source-policy.ts"

const MAX_ISSUES = 8
const SIGNIFICANT_NUMBER_MIN = 13
const GENERIC_KATAKANA_TERMS = new Set([
  "インド",
  "ルピー",
  "ドル",
  "リスク",
  "コスト",
  "メーカー",
  "ディーラー",
  "サプライヤー",
  "サプライチェーン",
  "ヘッジ",
  "シナリオ",
  "セクター",
  "マーケット",
  "レート",
])

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
    ...checkReferenceMapping(output, cluster),
    ...checkUnsupportedNumbers(output, cluster),
    ...checkCurrencyConfusion(output),
    ...checkSourceUsageEvidence(output, cluster),
    ...checkImplicationDepth(output),
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

function outputText(output: SynthesisOutput): string {
  return [
    output.title,
    output.summary,
    ...output.implications,
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
        ...extractLatinNames(fact),
      ]
      if (
        factEvidenceTokens.length > 0 &&
        !factEvidenceTokens.some((token) => articleText.toLowerCase().includes(token.toLowerCase()))
      ) {
        issues.push({
          issue: `sourceUsage の事実が生成本文で実質的に使われていない: 参考記事${usage.sourceIndex}`,
          instruction: `本文で使っていない参考記事${usage.sourceIndex}は sourceUsage と referenceUrls から外すこと。使う場合は、その事実を本文中に明確に反映すること。`,
        })
      }
    }
  }

  return issues
}

function checkImplicationDepth(output: SynthesisOutput): DeterministicIssue[] {
  const implication = output.implications[0] ?? ""
  if (!implication) return []

  const issues: DeterministicIssue[] = []
  if (implication.length < 100) {
    issues.push({
      issue: "implications が短く、記事固有の分析としての厚みが不足している",
      instruction: "implications は120〜220字を目安に、記事中の事実→作用経路→具体的判断・行動を1件の中で説明すること。",
    })
  }

  const hasMechanism = /(ため|ことで|により|通じて|押し下げ|押し上げ|波及|影響|リスク|コスト|需要|調達|投資|為替|金利|関税|人件費|消費)/.test(implication)
  const hasAction = /(見直|確認|検討|比較|交渉|設計|優先|着手|織り込|ヘッジ|在庫|契約|調達|投資判断|KPI|シナリオ)/.test(implication)
  if (!hasMechanism || !hasAction) {
    issues.push({
      issue: "implications が一般的な行動指示に寄っており、事実から行動までの因果が弱い",
      instruction: "implications は『何が変わるのか』という作用経路と、『どの部門が何を見直すか』という実務判断を両方含めること。",
    })
  }

  return issues
}

function checkImplicationIntroducesNewNames(output: SynthesisOutput): DeterministicIssue[] {
  const implication = output.implications[0] ?? ""
  if (!implication) return []

  const body = `${output.title}\n${output.summary}`
  const newNames = extractJapaneseNameLikeTerms(implication)
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

function extractLatinNames(text: string): string[] {
  return [...text.matchAll(/\b[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*)*\b/g)]
    .map((match) => match[0].trim())
    .filter((term) => term.length >= 3 && !/^(The|A|An|In|On|At|Of|For|And|Or|But)$/.test(term))
}

function extractJapaneseNameLikeTerms(text: string): string[] {
  const candidates = [
    ...text.matchAll(/[ァ-ヴー]{3,}(?:・[ァ-ヴー]{2,})*/g),
    ...text.matchAll(/[A-Z][A-Za-z0-9&.-]*(?:\s+[A-Z][A-Za-z0-9&.-]*)*/g),
  ].map((match) => match[0])

  return [...new Set(candidates)]
    .filter((term) => term.length >= 3)
    .filter((term) => !GENERIC_KATAKANA_TERMS.has(term))
}
