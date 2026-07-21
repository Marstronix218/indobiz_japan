import assert from "node:assert/strict"
import { afterEach, describe, it } from "node:test"
import {
  buildLineAuthorizeUrl,
  fetchLineFriendshipStatus,
  LINE_FRIENDSHIP_STATUS_URL,
  lineFriendProofRef,
} from "./line-auth.ts"

const originalChannelId = process.env.LINE_CHANNEL_ID
const originalFetch = globalThis.fetch

afterEach(() => {
  if (originalChannelId === undefined) {
    delete process.env.LINE_CHANNEL_ID
  } else {
    process.env.LINE_CHANNEL_ID = originalChannelId
  }
  globalThis.fetch = originalFetch
})

describe("LINE access unlock helpers", () => {
  it("requests an aggressive Official Account prompt", () => {
    process.env.LINE_CHANNEL_ID = "line-channel-id"

    const authorizeUrl = new URL(
      buildLineAuthorizeUrl({
        origin: "https://example.com",
        state: "csrf-state",
      }),
    )

    assert.equal(authorizeUrl.searchParams.get("bot_prompt"), "aggressive")
    assert.equal(authorizeUrl.searchParams.get("state"), "csrf-state")
    assert.equal(
      authorizeUrl.searchParams.get("redirect_uri"),
      "https://example.com/api/auth/line/callback",
    )
  })

  it("accepts friendFlag only when LINE returns a boolean", async () => {
    let requestedUrl = ""
    let authorization = ""
    globalThis.fetch = async (input, init) => {
      requestedUrl = String(input)
      authorization = new Headers(init?.headers).get("authorization") ?? ""
      return Response.json({ friendFlag: true })
    }

    assert.deepEqual(await fetchLineFriendshipStatus("line-access-token"), {
      friendFlag: true,
    })
    assert.equal(requestedUrl, LINE_FRIENDSHIP_STATUS_URL)
    assert.equal(authorization, "Bearer line-access-token")
  })

  it("rejects a malformed friendship response", async () => {
    globalThis.fetch = async () => Response.json({ friendFlag: "true" })

    await assert.rejects(
      fetchLineFriendshipStatus("line-access-token"),
      /missing friendFlag/,
    )
  })

  it("creates a stable hashed proof reference", () => {
    const proof = lineFriendProofRef("U123456")

    assert.match(proof, /^line:[0-9a-f]{64}$/)
    assert.equal(proof, lineFriendProofRef("U123456"))
    assert.notEqual(proof, lineFriendProofRef("U654321"))
    assert.equal(proof.includes("U123456"), false)
  })
})
