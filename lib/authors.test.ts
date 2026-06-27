import assert from "node:assert/strict"
import { test } from "node:test"

import { AUTHORS, resolveArticleAuthor } from "./authors.ts"

test("resolves from roster via authorId", () => {
  const author = resolveArticleAuthor({ authorId: "editorial" })
  assert.equal(author?.id, "editorial")
  assert.equal(author?.name, AUTHORS.editorial.name)
})

test("resolves from per-article override only", () => {
  const author = resolveArticleAuthor({
    author: { name: "山田太郎", title: "現地法人 社長" },
  })
  assert.equal(author?.id, "inline")
  assert.equal(author?.name, "山田太郎")
  assert.equal(author?.title, "現地法人 社長")
})

test("merges override over roster field-by-field, override wins", () => {
  const author = resolveArticleAuthor({
    authorId: "editorial",
    author: { title: "特集担当" },
  })
  // overridden field
  assert.equal(author?.title, "特集担当")
  // inherited field from roster
  assert.equal(author?.bio, AUTHORS.editorial.bio)
  // id stays from roster when override has none
  assert.equal(author?.id, "editorial")
})

test("returns null when neither source yields a name", () => {
  assert.equal(resolveArticleAuthor({}), null)
  assert.equal(resolveArticleAuthor({ authorId: "does_not_exist" }), null)
  assert.equal(resolveArticleAuthor({ author: { title: "肩書のみ" } }), null)
})
