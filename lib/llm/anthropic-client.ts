import Anthropic from "@anthropic-ai/sdk"
import { getDefaultSynthesisPromptBuilder } from "./prompt"
import {
  buildQualityCheckPrompt,
  buildRevisionPrompt,
} from "./quality-prompts"
import { parseSynthesisOutput } from "./parse"
import { parseQualityCheckOutput } from "./quality-parse"
import {
  LLMError,
  type LLMClient,
  type QualityCheckInput,
  type QualityCheckOutput,
  type ReviseSynthesisInput,
  type SynthesisInput,
  type SynthesisOutput,
  type SynthesizeOptions,
} from "./types"
import { isRetryableLLMError, sleep } from "./retry"

export class AnthropicClient implements LLMClient {
  private readonly client: Anthropic
  private readonly model: string
  private readonly maxTokens: number
  private readonly timeoutMs: number
  private readonly maxRetries: number

  constructor(opts?: { apiKey?: string; model?: string; maxTokens?: number; timeoutMs?: number; maxRetries?: number }) {
    const apiKey = opts?.apiKey ?? process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new LLMError("ANTHROPIC_API_KEY が設定されていません")
    }
    this.client = new Anthropic({ apiKey, maxRetries: 0 })
    this.model = opts?.model ?? process.env.LLM_MODEL_ANTHROPIC ?? "claude-sonnet-4-6"
    // 既定3500: 理解補助セクション(背景・影響・キーワード・キャプション)の追加で
    // 出力JSONが約1000トークン伸びたため、旧既定2000だと途中で切れて必ずパース失敗する。
    this.maxTokens = opts?.maxTokens ?? Number(process.env.LLM_MAX_TOKENS ?? 3500)
    this.timeoutMs = opts?.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 45000)
    this.maxRetries = opts?.maxRetries ?? Number(process.env.LLM_MAX_RETRIES ?? 3)
  }

  async synthesize(input: SynthesisInput, opts?: SynthesizeOptions): Promise<SynthesisOutput> {
    const { system, user } = (opts?.promptBuilder ?? getDefaultSynthesisPromptBuilder())(input)
    return this.callMessage(system, user, "synthesize", (raw) =>
      parseSynthesisOutput(raw, input),
    )
  }

  async checkQuality(input: QualityCheckInput): Promise<QualityCheckOutput> {
    const { system, user } = buildQualityCheckPrompt(input)
    return this.callMessage(
      system,
      user,
      "checkQuality",
      parseQualityCheckOutput,
    )
  }

  async reviseSynthesis(input: ReviseSynthesisInput): Promise<SynthesisOutput> {
    const { user, system } = buildRevisionPrompt(input)
    return this.callMessage(system, user, "reviseSynthesis", (raw) =>
      parseSynthesisOutput(raw, {
        cluster: input.cluster,
        categoryHint: input.categoryHint,
        industryHints: input.industryHints,
      }),
    )
  }

  private async callMessage<T>(
    system: string,
    user: string,
    label: string,
    parse: (raw: string) => T,
  ): Promise<T> {
    let lastError: unknown
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // システムプロンプト(巨大かつ1回の実行で全クラスタ共通)をプレフィックスキャッシュする。
        // 2回目以降の合成は入力分が約1割のキャッシュ読み取り価格になる。API的にはGA(betaヘッダ不要)
        // だが、当リポジトリの @anthropic-ai/sdk(0.30.x)の型は cache_control を含まないため
        // 型キャストで付与する(ランタイムではbodyがそのまま送信される)。
        const cachedSystem = [
          { type: "text", text: system, cache_control: { type: "ephemeral" } },
        ] as unknown as string
        const response = await this.client.messages.create(
          {
            model: this.model,
            max_tokens: this.maxTokens,
            system: cachedSystem,
            messages: [{ role: "user", content: user }],
          },
          { timeout: this.timeoutMs },
        )

        const u = response.usage as typeof response.usage & {
          cache_read_input_tokens?: number | null
          cache_creation_input_tokens?: number | null
        }
        if (u && ((u.cache_read_input_tokens ?? 0) > 0 || (u.cache_creation_input_tokens ?? 0) > 0)) {
          console.log(
            `[anthropic:${label}] cache read=${u.cache_read_input_tokens ?? 0} write=${u.cache_creation_input_tokens ?? 0} input=${u.input_tokens} output=${u.output_tokens}`,
          )
        }

        const textBlock = response.content.find((block) => block.type === "text")
        if (!textBlock || textBlock.type !== "text") {
          throw new LLMError("Claude応答にテキストブロックがありません")
        }

        // Parse inside the retry boundary. A truncated/malformed JSON response
        // is just as retryable as a transient transport error.
        return parse(textBlock.text)
      } catch (error) {
        lastError = error
        const isParseError =
          error instanceof LLMError &&
          (error.message.includes("JSONパースに失敗") ||
            error.message.includes("JSONオブジェクトが見つかりません") ||
            error.message.includes("必須フィールドが欠落"))
        const retryable = isParseError || isRetryableLLMError(error)
        if (attempt < this.maxRetries && retryable) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.floor(Math.random() * 500)
          console.warn(
            `[anthropic:${label}] retryable error on attempt ${attempt + 1}/${this.maxRetries + 1}, retrying in ${delayMs}ms: ${error instanceof Error ? error.message : String(error)}`,
          )
          await sleep(delayMs)
          continue
        }
        if (error instanceof LLMError) throw error
        throw new LLMError(
          `Claude呼び出しに失敗 (${label}): ${error instanceof Error ? error.message : String(error)}`,
          error,
        )
      }
    }
    throw new LLMError(
      `Claude呼び出しに失敗 (${label}, リトライ上限到達): ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      lastError,
    )
  }
}
