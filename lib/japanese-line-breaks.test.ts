import assert from "node:assert/strict"
import test from "node:test"
import { addJapanesePhraseBreaks } from "./japanese-line-breaks.ts"

test("keeps compound title phrases intact", () => {
  const result = addJapanesePhraseBreaks(
    "インド政府、蓄電池10GWh製造で国際入札公告 PLI ACCスキーム残枠を公募",
  )

  assert(result.includes("国際入札公告"))
  assert(!result.includes("国際\u200B入札"))
  assert(!result.includes("入札\u200B公告"))
})

test("adds wrap opportunities after punctuation and particles", () => {
  assert.equal(
    addJapanesePhraseBreaks("インド政府、制度への対応を公表"),
    "インド政府、\u200B制度への\u200B対応を\u200B公表",
  )
})
