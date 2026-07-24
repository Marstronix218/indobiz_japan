/**
 * Single source of truth for reader-facing date display.
 *
 * Canonical format is `2026/8/5` — year/month/day, no zero padding — with
 * `2026/8/5 21:00` when a time is shown. Components must not call
 * `toLocaleDateString` / `Intl.DateTimeFormat` directly for display; route
 * everything through these helpers so the format stays consistent.
 */

export const TOKYO_TZ = "Asia/Tokyo"
export const KOLKATA_TZ = "Asia/Kolkata"

export type DateInput = string | number | Date | null | undefined

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

type FormatterOptions = {
  timeZone: string
  withTime: boolean
  withWeekday: boolean
}

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

function getFormatter({
  timeZone,
  withTime,
  withWeekday,
}: FormatterOptions): Intl.DateTimeFormat {
  const key = `${timeZone}|${withTime}|${withWeekday}`
  const cached = FORMATTER_CACHE.get(key)
  if (cached) return cached

  // ja-JP numeric parts render as `2026/8/5` — exactly the canonical format.
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(withWeekday ? { weekday: "short" as const } : {}),
    ...(withTime
      ? { hour: "2-digit" as const, minute: "2-digit" as const, hour12: false }
      : {}),
  })
  FORMATTER_CACHE.set(key, formatter)
  return formatter
}

/**
 * Assembled from parts rather than `format()` so the weekday spacing is ours
 * (`2026/8/5 (水)`) instead of the locale's (`2026/8/5(水)`).
 */
function render(d: Date, options: FormatterOptions): string {
  const parts = getFormatter(options).formatToParts(d)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ""

  let out = `${part("year")}/${part("month")}/${part("day")}`
  if (options.withWeekday) out += ` (${part("weekday")})`
  if (options.withTime) out += ` ${part("hour")}:${part("minute")}`
  return out
}

/** `2026/8/5` in JST. Returns "" for empty input, the raw value if unparseable. */
export function formatDate(value: DateInput, timeZone = TOKYO_TZ): string {
  const d = toDate(value)
  if (!d) return value == null ? "" : String(value)
  return render(d, { timeZone, withTime: false, withWeekday: false })
}

/** `2026/8/5 (水)` in JST — used by the masthead. */
export function formatDateWithWeekday(
  value: DateInput,
  timeZone = TOKYO_TZ,
): string {
  const d = toDate(value)
  if (!d) return value == null ? "" : String(value)
  return render(d, { timeZone, withTime: false, withWeekday: true })
}

/** `2026/8/5 21:00`. Returns "" for empty input, the raw value if unparseable. */
export function formatDateTime(value: DateInput, timeZone = TOKYO_TZ): string {
  const d = toDate(value)
  if (!d) return value == null ? "" : String(value)
  return render(d, { timeZone, withTime: true, withWeekday: false })
}

/** Unix seconds → `2026/8/5 21:00` in the given zone (market feeds use epoch seconds). */
export function formatUnixDateTime(
  seconds: number,
  timeZone = TOKYO_TZ,
): string {
  return formatDateTime(seconds * 1000, timeZone)
}
