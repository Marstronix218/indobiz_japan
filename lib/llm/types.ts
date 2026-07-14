export interface SynthesisSource {
  source: string
  sourceUrl: string
  publishedAt: string
  title: string
  bodyText: string
}

export interface SynthesisInput {
  cluster: SynthesisSource[]
  categoryHint?: string
  industryHints?: string[]
}

export interface IndiaRelevance {
  score: 0 | 1 | 2 | 3
  reason: string
}

export interface JapaneseBusinessRelevance {
  score: 0 | 1 | 2 | 3
  reason: string
}

export interface ReferenceUrl {
  title: string
  url: string
}

export interface SourceUsage {
  sourceIndex: number
  factsUsed: string[]
}

export interface SynthesisKeyword {
  term: string
  fullName?: string
  definition: string
}

export interface SynthesisOutput {
  title: string
  summary: string
  implications: string[]
  industryTags: string[]
  category: string
  referenceUrls: ReferenceUrl[]
  sourceUsage?: SourceUsage[]
  indiaRelevance: IndiaRelevance
  japaneseBusinessRelevance: JapaneseBusinessRelevance
  imagePrompt: string
  // 以下は理解補助セクション。生成・パースに失敗しても本文の保存は止めない
  // ため任意フィールドとし、失敗時は undefined(=DBではnull)へフォールバックする。
  backgroundContext?: string
  japanBusinessImpact?: string
  keywords?: SynthesisKeyword[]
  imageCaption?: string
}

export type QualityVerdict = "PASS" | "REVISION" | "REJECT"

export interface QualityCheckInput {
  output: SynthesisOutput
  cluster: SynthesisSource[]
}

export interface QualityCheckOutput {
  verdict: QualityVerdict
  issues: string[]
  revisionInstructions?: string
}

export interface ReviseSynthesisInput {
  cluster: SynthesisSource[]
  previousOutput: SynthesisOutput
  revisionInstructions: string
  categoryHint?: string
  industryHints?: string[]
}

export interface SynthesizeOptions {
  // プロンプトビルダーの明示的 override(実験用 A/B 等)。未指定なら環境フラグで既定を選ぶ。
  promptBuilder?: (input: SynthesisInput) => { system: string; user: string }
}

export interface LLMClient {
  synthesize(input: SynthesisInput, opts?: SynthesizeOptions): Promise<SynthesisOutput>
  checkQuality(input: QualityCheckInput): Promise<QualityCheckOutput>
  reviseSynthesis(input: ReviseSynthesisInput): Promise<SynthesisOutput>
}

export class LLMError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "LLMError"
  }
}
