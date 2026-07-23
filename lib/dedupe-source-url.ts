import { normalizeSourceUrl } from "./llm/source-policy.ts"

/**
 * Build a stable set of source URLs for cross-run duplicate detection.
 * Empty URLs are ignored and tracking parameters are removed by the shared
 * source normalizer.
 */
export function buildDedupeSourceUrls(
  urls: Array<string | null | undefined>,
): Set<string> {
  return new Set(
    urls
      .map((url) => url?.trim())
      .filter((url): url is string => Boolean(url))
      .map(normalizeSourceUrl),
  )
}

export function hasSharedDedupeSourceUrl(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): boolean {
  for (const url of left) {
    if (right.has(url)) return true
  }
  return false
}
