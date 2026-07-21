export function isBetaAccessEnabled(): boolean {
  return process.env.BETA_ACCESS_ENABLED === "1"
}
