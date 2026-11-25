/**
 * OAuth 1.0a (HMAC-SHA1) の Authorization ヘッダ生成。純粋関数(テスト: x-oauth.test.ts)。
 *
 * 自社アカウント1つから投稿するだけなので、リフレッシュトークンの保管が要る
 * OAuth 2.0 ではなく、Developer Portal で発行できる Access Token/Secret を
 * そのまま使える OAuth 1.0a を採用している。
 * JSONボディ(v2 /2/tweets)は署名対象に含まれない。クエリ文字列のみ含める。
 */
import { createHmac, randomBytes } from "node:crypto"

export interface OAuth1Credentials {
  consumerKey: string
  consumerSecret: string
  accessToken: string
  accessTokenSecret: string
}

/** RFC 3986 のパーセントエンコード(encodeURIComponent は !'()* を残すので補う)。 */
export function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

export interface OAuth1SignInput {
  method: string
  url: string
  credentials: OAuth1Credentials
  /** 署名対象に含めるパラメータ(クエリ、フォームボディ)。 */
  params?: Record<string, string>
  nonce?: string
  timestamp?: string
}

export function oauth1Signature(input: OAuth1SignInput): {
  signature: string
  oauthParams: Record<string, string>
} {
  const { credentials } = input
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_nonce: input.nonce ?? randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: input.timestamp ?? Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
  }

  const url = new URL(input.url)
  const all: Array<[string, string]> = [
    ...Object.entries(oauthParams),
    ...Object.entries(input.params ?? {}),
    ...Array.from(url.searchParams.entries()),
  ]
  const paramString = all
    .map(([k, v]) => [percentEncode(k), percentEncode(v)] as const)
    .sort(([ak, av], [bk, bv]) => (ak === bk ? (av < bv ? -1 : 1) : ak < bk ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&")

  const baseUrl = `${url.protocol}//${url.host}${url.pathname}`
  const baseString = [
    input.method.toUpperCase(),
    percentEncode(baseUrl),
    percentEncode(paramString),
  ].join("&")
  const signingKey = `${percentEncode(credentials.consumerSecret)}&${percentEncode(
    credentials.accessTokenSecret,
  )}`
  const signature = createHmac("sha1", signingKey).update(baseString).digest("base64")
  return { signature, oauthParams }
}

export function oauth1AuthorizationHeader(input: OAuth1SignInput): string {
  const { signature, oauthParams } = oauth1Signature(input)
  const header = Object.entries({ ...oauthParams, oauth_signature: signature })
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(", ")
  return `OAuth ${header}`
}
