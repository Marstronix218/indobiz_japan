export function getSafeAuthRedirectPath(nextPath: string | null | undefined): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/"
  }
  return nextPath
}
