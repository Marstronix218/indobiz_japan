import { AnthropicClient } from "./anthropic-client"
import type { LLMClient } from "./types"

export type {
  LLMClient,
  QualityCheckInput,
  QualityCheckOutput,
  QualityVerdict,
  ReviseSynthesisInput,
  SynthesisInput,
  SynthesisKeyword,
  SynthesisOutput,
  SynthesisSource,
} from "./types"
export { LLMError } from "./types"

export function getLLMClient(): LLMClient {
  // 記事本文・本記事のポイント・背景・日本企業への影響・キーワード、
  // およびそれらの品質チェック/再生成は Anthropic に固定する。
  // 画像生成のプロバイダー選択は lib/image-gen 側で独立して扱う。
  return new AnthropicClient()
}
