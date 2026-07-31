const MAX_ARTICLE_TAKEAWAYS = 3

/**
 * Keeps the takeaways section strictly opt-in. The article body must never be
 * repurposed as takeaways when the editor leaves the field empty.
 */
export function getArticleTakeaways(implications: readonly string[]): string[] {
  return implications
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_ARTICLE_TAKEAWAYS)
}
