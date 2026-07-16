import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8")

test("article LLM factory is hard-wired to Anthropic", () => {
  assert.match(source, /return new AnthropicClient\(\)/)
  assert.doesNotMatch(source, /OpenAIClient|LLM_PROVIDER/)
})
