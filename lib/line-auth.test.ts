import assert from "node:assert/strict"
import test from "node:test"
import { buildLineAuthorizeUrl } from "./line-auth.ts"

test("builds a minimal LINE account login URL", () => {
  const previousChannelId = process.env.LINE_CHANNEL_ID
  process.env.LINE_CHANNEL_ID = "campaign-channel"

  try {
    const url = new URL(
      buildLineAuthorizeUrl({
        origin: "https://indobiz.example",
        state: "unique-state",
      }),
    )

    assert.equal(url.searchParams.get("response_type"), "code")
    assert.equal(url.searchParams.get("client_id"), "campaign-channel")
    assert.equal(url.searchParams.get("scope"), "profile")
    assert.equal(url.searchParams.get("state"), "unique-state")
    assert.equal(url.searchParams.has("bot_prompt"), false)
    assert.equal(
      url.searchParams.get("redirect_uri"),
      "https://indobiz.example/api/auth/line/callback",
    )
  } finally {
    if (previousChannelId === undefined) delete process.env.LINE_CHANNEL_ID
    else process.env.LINE_CHANNEL_ID = previousChannelId
  }
})
