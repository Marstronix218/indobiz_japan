import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8")

function readSibling(filename: string) {
  return readFileSync(new URL(filename, import.meta.url), "utf8")
}

test("article LLM factory is hard-wired to Anthropic", () => {
  assert.match(source, /return new AnthropicClient\(\)/)
  assert.doesNotMatch(source, /OpenAIClient|LLM_PROVIDER/)
})

test("article generation does not request, parse, check, or persist image captions", () => {
  const generationSources = [
    "./types.ts",
    "./prompt.ts",
    "./parse.ts",
    "./quality-prompts.ts",
    "./output-quality-guard.ts",
    "../automation.ts",
  ].map(readSibling)

  for (const generationSource of generationSources) {
    assert.doesNotMatch(generationSource, /imageCaption/)
  }
})
