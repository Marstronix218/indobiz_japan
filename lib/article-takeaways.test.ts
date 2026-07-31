import assert from "node:assert/strict"
import { test } from "node:test"
import { getArticleTakeaways } from "./article-takeaways.ts"

test("does not generate takeaways when the editor leaves them empty", () => {
  assert.deepEqual(getArticleTakeaways([]), [])
  assert.deepEqual(getArticleTakeaways(["", "  ", "\n"]), [])
})

test("returns only explicitly entered takeaways", () => {
  assert.deepEqual(
    getArticleTakeaways([" Point 1 ", "Point 2", "Point 3", "Point 4"]),
    ["Point 1", "Point 2", "Point 3"],
  )
})
