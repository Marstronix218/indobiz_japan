import assert from "node:assert/strict"
import { test } from "node:test"
import { oauth1AuthorizationHeader, oauth1Signature, percentEncode } from "./x-oauth.ts"

// Twitter公式ドキュメント「Creating a signature」の例と同じ入力・期待値。
const credentials = {
  consumerKey: "xvz1evFS4wEEPTGEFPHBog",
  consumerSecret: "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
  accessToken: "370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
  accessTokenSecret: "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
}

test("matches the documented OAuth 1.0a signature example", () => {
  const { signature } = oauth1Signature({
    method: "POST",
    url: "https://api.twitter.com/1.1/statuses/update.json?include_entities=true",
    credentials,
    params: { status: "Hello Ladies + Gentlemen, a signed OAuth request!" },
    nonce: "kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
    timestamp: "1318622958",
  })
  assert.equal(signature, "hCtSmYh+iHYCEqBWrE7C7hYmtUk=")
})

test("percentEncode follows RFC 3986", () => {
  assert.equal(percentEncode("Hello Ladies + Gentlemen!"), "Hello%20Ladies%20%2B%20Gentlemen%21")
  assert.equal(percentEncode("*'()"), "%2A%27%28%29")
})

test("authorization header contains every oauth parameter", () => {
  const header = oauth1AuthorizationHeader({
    method: "POST",
    url: "https://api.x.com/2/tweets",
    credentials,
    nonce: "n",
    timestamp: "1",
  })
  assert.ok(header.startsWith("OAuth "))
  for (const key of [
    "oauth_consumer_key",
    "oauth_nonce",
    "oauth_signature",
    "oauth_signature_method",
    "oauth_timestamp",
    "oauth_token",
    "oauth_version",
  ]) {
    assert.ok(header.includes(`${key}="`), key)
  }
})
