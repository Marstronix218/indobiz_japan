/**
 * Wraps a raw image idea in the project's brand + safety constraints before it
 * is sent to the image provider. Shared by the automation pipeline and the
 * admin "generate image" route so both produce images under identical rules
 * (bright editorial lighting, generic/anonymous imagery, no logos or real
 * people). Returns an empty string when there is nothing to base a prompt on.
 */
export function buildSafeImagePrompt(prompt: string, fallbackTitle: string): string {
  const base = prompt && prompt.trim().length > 0 ? prompt.trim() : fallbackTitle.trim()
  if (!base) return ""

  return [
    base,
    "Prefer bright daylight, bright indoor light, or high-key natural editorial lighting with balanced exposure and a clear bright atmosphere.",
    "Avoid dark, moody, dim, night, dawn, low-key lighting, heavy shadows, gloomy scenes, and muted dark tones.",
    "Use only generic, anonymous editorial imagery.",
    "No company logos, brand names, trademarks, product branding, readable signage, identifiable buildings, named public figures, executives, politicians, celebrities, or recognizable real people.",
  ].join(" ")
}
