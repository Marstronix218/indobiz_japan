import type { ReferenceUrl, SourceUsage, SynthesisInput } from "./types"

const TITLE_SOURCE_SUFFIX =
  /\s+(?:[-–—|])\s+(?:reuters|associated press|ap news|bloomberg|bbc|cnn|cnbc|financial times|the hindu|hindustan times|times of india|the economic times|the new indian express|indian express|mint|moneycontrol|business standard|ndtv|deccan herald|firstpost|the print|pib)$/i
const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
]

export function normalizeSourceTitle(title: string): string {
  return title
    .replace(TITLE_SOURCE_SUFFIX, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

export function normalizeSourceUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ""
    for (const param of TRACKING_PARAMS) parsed.searchParams.delete(param)
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/"
    return parsed.toString().replace(/\/$/, "").toLowerCase()
  } catch {
    return url.split("#")[0].replace(/\/+$/, "").toLowerCase()
  }
}

export function sanitizeReferenceUrls(
  rawReferences: ReferenceUrl[],
  input?: SynthesisInput,
  sourceUsage?: SourceUsage[],
): ReferenceUrl[] {
  if (!input || input.cluster.length === 0) return dedupeReferences(rawReferences)

  const selectedIndexes = new Set(
    (sourceUsage ?? [])
      .filter((usage) => usage.factsUsed.length > 0)
      .map((usage) => usage.sourceIndex - 1)
      .filter((index) => index >= 0 && index < input.cluster.length),
  )

  const candidates = selectedIndexes.size > 0
    ? [...selectedIndexes].map((index) => input.cluster[index])
    : rawReferences
        .map((reference) => {
          const urlKey = normalizeSourceUrl(reference.url)
          const titleKey = normalizeSourceTitle(reference.title)
          return input.cluster.find(
            (source) =>
              normalizeSourceUrl(source.sourceUrl) === urlKey ||
              normalizeSourceTitle(source.title) === titleKey,
          )
        })
        .filter((source): source is SynthesisInput["cluster"][number] => Boolean(source))

  // Empty model output must not expand to every clustered source. One primary
  // source is a safer fallback than publishing unrelated references.
  const selected = candidates.length > 0 ? dedupeSources(candidates) : [input.cluster[0]]
  return dedupeReferences(
    selected.map((source) => ({ title: source.title, url: source.sourceUrl })),
  )
}

function dedupeSources(
  sources: SynthesisInput["cluster"],
): SynthesisInput["cluster"] {
  const result: SynthesisInput["cluster"] = []

  for (const source of sources) {
    const duplicateIndex = result.findIndex(
      (existing) =>
        normalizeSourceUrl(existing.sourceUrl) === normalizeSourceUrl(source.sourceUrl) ||
        normalizeSourceTitle(existing.title) === normalizeSourceTitle(source.title) ||
        bodySimilarity(existing.bodyText, source.bodyText) >= 0.9,
    )

    if (duplicateIndex < 0) {
      result.push(source)
      continue
    }

    // If a Google News redirect and the original publisher article both exist,
    // keep the publisher URL. The public reference list should not cite a
    // redirect as an independent source.
    const existing = result[duplicateIndex]
    if (isGoogleNewsUrl(existing.sourceUrl) && !isGoogleNewsUrl(source.sourceUrl)) {
      result[duplicateIndex] = source
    }
  }

  return result
}

function isGoogleNewsUrl(url: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase() === "news.google.com"
  } catch {
    return false
  }
}

function bodySimilarity(a: string, b: string): number {
  const left = tokenSet(a)
  const right = tokenSet(b)
  if (left.size === 0 || right.size === 0) return 0

  let intersection = 0
  for (const token of left) {
    if (right.has(token)) intersection += 1
  }
  return intersection / Math.max(left.size, right.size)
}

function tokenSet(text: string): Set<string> {
  const normalized = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
  return new Set(
    normalized
      .split(/\s+/)
      .filter((token) => token.length >= 4)
      .slice(0, 250),
  )
}

function dedupeReferences(references: ReferenceUrl[]): ReferenceUrl[] {
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  const result: ReferenceUrl[] = []

  for (const reference of references) {
    const urlKey = normalizeSourceUrl(reference.url)
    const titleKey = normalizeSourceTitle(reference.title)
    if (!urlKey || !titleKey || seenUrls.has(urlKey) || seenTitles.has(titleKey)) continue
    seenUrls.add(urlKey)
    seenTitles.add(titleKey)
    result.push(reference)
  }
  return result
}
