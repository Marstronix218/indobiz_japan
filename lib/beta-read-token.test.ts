import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { BETA_READ_QUALIFY_MS } from "./beta-config.ts"
import { createBetaReadToken, verifyQualifiedBetaReadToken } from "./beta-read-token.ts"

process.env.BETA_READ_SECRET = "beta-read-test-secret-that-is-not-used-in-production"

const userId = "11111111-1111-4111-8111-111111111111"
const articleId = "22222222-2222-4222-8222-222222222222"

describe("beta read proof", () => {
  it("rejects a proof before the minimum active reading time", () => {
    const token = createBetaReadToken(userId, articleId)
    assert.equal(verifyQualifiedBetaReadToken(token, userId, articleId), false)
  })

  it("accepts a correctly bound proof after the minimum reading time", () => {
    const token = createBetaReadToken(
      userId,
      articleId,
      Date.now() - BETA_READ_QUALIFY_MS - 100,
    )
    assert.equal(verifyQualifiedBetaReadToken(token, userId, articleId), true)
  })

  it("rejects tampering and cross-user reuse", () => {
    const token = createBetaReadToken(
      userId,
      articleId,
      Date.now() - BETA_READ_QUALIFY_MS - 100,
    )
    assert.equal(
      verifyQualifiedBetaReadToken(token, "33333333-3333-4333-8333-333333333333", articleId),
      false,
    )
    assert.equal(verifyQualifiedBetaReadToken(`${token}x`, userId, articleId), false)
  })
})
