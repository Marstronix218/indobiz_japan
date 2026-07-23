import assert from "node:assert/strict"
import { test } from "node:test"

import {
  BETA_DAY_MS,
  BETA_EXTENSION_ACCESS_DAYS,
  BETA_INITIAL_ACCESS_DAYS,
  evaluateBetaAccess,
} from "./beta-access.ts"

const NOW = Date.UTC(2026, 6, 23, 12)
const isoDaysAgo = (days: number) =>
  new Date(NOW - days * BETA_DAY_MS).toISOString()

test("uses two 14-day beta periods", () => {
  assert.equal(BETA_INITIAL_ACCESS_DAYS, 14)
  assert.equal(BETA_EXTENSION_ACCESS_DAYS, 14)
})

test("initial access remains active just before the 14-day boundary", () => {
  const status = evaluateBetaAccess(
    { trialStartedAt: new Date(NOW - 14 * BETA_DAY_MS + 1).toISOString() },
    NOW,
  )
  assert.equal(status.phase, "initial_access")
  assert.equal(status.hasFullAccess, true)
  assert.equal(status.shouldOfferSurvey, false)
})

test("initial access locks and offers the survey exactly at 14 days", () => {
  const status = evaluateBetaAccess(
    { trialStartedAt: isoDaysAgo(14) },
    NOW,
  )
  assert.equal(status.phase, "survey_required")
  assert.equal(status.hasFullAccess, false)
  assert.equal(status.shouldOfferSurvey, true)
})

test("a redeemed extension grants access until its database expiry", () => {
  const status = evaluateBetaAccess(
    {
      trialStartedAt: isoDaysAgo(20),
      surveyCompletedAt: isoDaysAgo(5),
      extensionStartedAt: isoDaysAgo(5),
      extensionExpiresAt: new Date(NOW + 9 * BETA_DAY_MS).toISOString(),
    },
    NOW,
  )
  assert.equal(status.phase, "extension_access")
  assert.equal(status.hasFullAccess, true)
  assert.equal(status.extensionHasBeenUsed, true)
})

test("an extension locks exactly at its expiry and cannot offer another survey", () => {
  const status = evaluateBetaAccess(
    {
      trialStartedAt: isoDaysAgo(30),
      surveyCompletedAt: isoDaysAgo(14),
      extensionStartedAt: isoDaysAgo(14),
      extensionExpiresAt: isoDaysAgo(0),
    },
    NOW,
  )
  assert.equal(status.phase, "expired")
  assert.equal(status.hasFullAccess, false)
  assert.equal(status.shouldOfferSurvey, false)
  assert.equal(status.extensionHasBeenUsed, true)
})

test("a malformed database record fails closed", () => {
  const status = evaluateBetaAccess({ trialStartedAt: "invalid" }, NOW)
  assert.equal(status.phase, "expired")
  assert.equal(status.hasFullAccess, false)
})
