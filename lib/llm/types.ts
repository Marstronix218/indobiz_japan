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
  /**
   * Active reader-feedback amendments appended to the synthesis system prompt.
   * Additive guidance only — never overrides the core editorial/safety rules.
   */
  promptAmendments?: string[]
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

export interface SynthesisOutput {
  title: string
  summary: string
  implications: string[]
  industryTags: string[]
  category: string
  referenceUrls: ReferenceUrl[]
  indiaRelevance: IndiaRelevance
  japaneseBusinessRelevance: JapaneseBusinessRelevance
  imagePrompt: string
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

export type FeedbackVerdict = "ACCEPT" | "REJECT"

export type FeedbackCategory =
  | "actionable"
  | "destructive"
  | "incorrect"
  | "spam"
  | "not_prompt_related"

export interface FeedbackGateInput {
  /** The reader's free-text feedback. */
  message: string
  /** Article context the gate uses to judge correctness/relevance. */
  article: {
    title: string
    summary: string
    category: string
    implications: string[]
    sourceTitles: string[]
  }
}

export interface FeedbackGateOutput {
  verdict: FeedbackVerdict
  category: FeedbackCategory
  /** Confidence 0..1 that the verdict is correct. */
  score: number
  /** Japanese explanation, surfaced to admins. */
  reason: string
  /**
   * A short additive Japanese guidance line for the synthesis prompt.
   * Populated ONLY when verdict=ACCEPT and the feedback is a safe,
   * generalizable improvement. null otherwise.
   */
  amendment: string | null
}

export interface LLMClient {
  synthesize(input: SynthesisInput): Promise<SynthesisOutput>
  checkQuality(input: QualityCheckInput): Promise<QualityCheckOutput>
  reviseSynthesis(input: ReviseSynthesisInput): Promise<SynthesisOutput>
  gradeFeedback(input: FeedbackGateInput): Promise<FeedbackGateOutput>
}

export class LLMError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = "LLMError"
  }
}
