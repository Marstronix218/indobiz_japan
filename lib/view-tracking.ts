/**
 * Fire-and-forget: record a view for the given article. Any failure is
 * swallowed — view logging must never affect the reader experience.
 */
export function recordArticleViewClient(id: string): void {
  try {
    void fetch(`/api/articles/${id}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
