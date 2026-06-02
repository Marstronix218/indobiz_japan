import { FREE_ARTICLE_LIMIT } from "@/lib/site-config"

/**
 * Cookie tracking which article IDs an unauthenticated visitor has already
 * opened. Capped at `FREE_ARTICLE_LIMIT` entries — once full, any *new*
 * article ID is gated behind login (see `proxy.ts` + the article page).
 */
export const FREE_VIEW_COOKIE = "ib_viewed"

// ~180 days; the free-read allowance resets only when the cookie expires.
export const FREE_VIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

export function parseViewedIds(value: string | undefined | null): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, FREE_ARTICLE_LIMIT)
}

export function serializeViewedIds(ids: string[]): string {
  return ids.slice(0, FREE_ARTICLE_LIMIT).join(",")
}

/**
 * Returns the (possibly unchanged) viewed list after recording a visit to
 * `articleId`. Adds the ID only when it's new and the free allowance still
 * has room; returns `changed` so callers know whether to persist the cookie.
 */
export function recordView(
  viewed: string[],
  articleId: string,
): { viewed: string[]; changed: boolean } {
  if (viewed.includes(articleId)) return { viewed, changed: false }
  if (viewed.length >= FREE_ARTICLE_LIMIT) return { viewed, changed: false }
  return { viewed: [...viewed, articleId], changed: true }
}
