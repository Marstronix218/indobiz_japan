export function getSafeAuthRedirectPath(nextPath: string | null | undefined): string {
  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(nextPath)
  ) {
    return "/"
  }
  return nextPath
}
