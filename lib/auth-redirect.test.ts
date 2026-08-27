import assert from "node:assert/strict"
import test from "node:test"
import { getSafeAuthRedirectPath } from "./auth-redirect.ts"

test("allows local redirect paths", () => {
  assert.equal(getSafeAuthRedirectPath("/article/123?tab=summary"), "/article/123?tab=summary")
})

test("rejects external and backslash redirect forms", () => {
  assert.equal(getSafeAuthRedirectPath("https://evil.example"), "/")
  assert.equal(getSafeAuthRedirectPath("//evil.example"), "/")
  assert.equal(getSafeAuthRedirectPath("/\\evil.example"), "/")
  assert.equal(getSafeAuthRedirectPath("/article/123\nSet-Cookie:x"), "/")
})
