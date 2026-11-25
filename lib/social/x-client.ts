import { oauth1AuthorizationHeader, type OAuth1Credentials } from "./x-oauth"

const X_TWEETS_ENDPOINT = "https://api.x.com/2/tweets"
const X_TIMEOUT_MS = 15_000

/** X_API_KEY 等が全部そろっていれば資格情報を返す。1つでも欠けていれば null。 */
export function readXCredentialsFromEnv(): OAuth1Credentials | null {
  const consumerKey = process.env.X_API_KEY?.trim()
  const consumerSecret = process.env.X_API_SECRET?.trim()
  const accessToken = process.env.X_ACCESS_TOKEN?.trim()
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET?.trim()
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) return null
  return { consumerKey, consumerSecret, accessToken, accessTokenSecret }
}

export class XApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message)
    this.name = "XApiError"
  }
}

/** X API v2 でテキストを投稿し、投稿IDを返す。 */
export async function postTweet(
  text: string,
  credentials: OAuth1Credentials,
): Promise<{ id: string }> {
  const authorization = oauth1AuthorizationHeader({
    method: "POST",
    url: X_TWEETS_ENDPOINT,
    credentials,
  })

  const response = await fetch(X_TWEETS_ENDPOINT, {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(X_TIMEOUT_MS),
  })

  const body = await response.text()
  if (!response.ok) {
    throw new XApiError(`X API ${response.status}: ${body.slice(0, 500)}`, response.status, body)
  }

  let id: unknown
  try {
    id = (JSON.parse(body) as { data?: { id?: unknown } }).data?.id
  } catch {
    // fallthrough
  }
  if (typeof id !== "string") {
    throw new XApiError(`X API returned no post id: ${body.slice(0, 500)}`, response.status, body)
  }
  return { id }
}
