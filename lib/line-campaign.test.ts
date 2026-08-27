import assert from "node:assert/strict"
import test from "node:test"
import {
  hasLineCampaignAccess,
  isValidLineCampaignCode,
} from "./line-campaign.ts"

test("grants access only from trusted app metadata", () => {
  assert.equal(
    hasLineCampaignAccess({
      app_metadata: { indobiz_line_campaign: true },
    }),
    true,
  )
  assert.equal(
    hasLineCampaignAccess({
      app_metadata: { indobiz_line_verified: true },
    }),
    true,
  )
  assert.equal(
    hasLineCampaignAccess({
      user_metadata: { indobiz_line_campaign: true },
    }),
    false,
  )
  assert.equal(hasLineCampaignAccess(null), false)
})

test("accepts the shared code with harmless casing and whitespace differences", () => {
  assert.equal(isValidLineCampaignCode(" indobiz-line ", "INDOBIZ-LINE"), true)
  assert.equal(isValidLineCampaignCode("wrong-code", "INDOBIZ-LINE"), false)
  assert.equal(isValidLineCampaignCode("", "INDOBIZ-LINE"), false)
})
