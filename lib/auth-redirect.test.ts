import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { getSafeAuthRedirectPath } from "./auth-redirect.ts"

describe("safe auth redirects", () => {
  it("keeps local paths with query parameters", () => {
    assert.equal(
      getSafeAuthRedirectPath("/article/abc?line_friend_required=1"),
      "/article/abc?line_friend_required=1",
    )
  })

  it("rejects absolute, protocol-relative, and backslash redirects", () => {
    assert.equal(getSafeAuthRedirectPath("https://evil.example"), "/")
    assert.equal(getSafeAuthRedirectPath("//evil.example/path"), "/")
    assert.equal(getSafeAuthRedirectPath("/\\evil.example/path"), "/")
    assert.equal(getSafeAuthRedirectPath("/%5cevil.example/path"), "/")
  })
})
