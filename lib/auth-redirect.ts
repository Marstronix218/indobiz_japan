export function getSafeAuthRedirectPath(nextPath: string | null | undefined): string {
  if (!nextPath || /[\\\u0000-\u001f\u007f]/.test(nextPath)) return "/"

  try {
    const decoded = decodeURIComponent(nextPath)
    if (/[\\\u0000-\u001f\u007f]/.test(decoded)) return "/"

    const base = new URL("https://indobiz.invalid")
    const resolved = new URL(nextPath, base)
    if (resolved.origin !== base.origin || !resolved.pathname.startsWith("/")) return "/"
    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return "/"
  }
}
