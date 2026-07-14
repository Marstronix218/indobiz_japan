/** WMO weather code → 日本語ラベル。Open-Meteo の current.weather_code に対応。 */
const WMO_LABELS: Record<number, string> = {
  0: "快晴",
  1: "晴れ",
  2: "薄曇り",
  3: "曇り",
  45: "霧",
  48: "霧（着氷）",
  51: "霧雨（弱）",
  53: "霧雨",
  55: "霧雨（強）",
  56: "着氷性霧雨",
  57: "着氷性霧雨（強）",
  61: "雨（弱）",
  63: "雨",
  65: "雨（強）",
  66: "着氷性の雨",
  67: "着氷性の雨（強）",
  71: "雪（弱）",
  73: "雪",
  75: "雪（強）",
  77: "霧雪",
  80: "にわか雨（弱）",
  81: "にわか雨",
  82: "にわか雨（激）",
  85: "にわか雪",
  86: "にわか雪（強）",
  95: "雷雨",
  96: "雷雨（雹）",
  99: "雷雨（激しい雹）",
}

export function describeWeatherCode(code: number): string {
  return WMO_LABELS[code] ?? "—"
}

/** WMO weather code → お天気絵文字。未知コードは中立な温度計にフォールバック。 */
export function weatherCodeEmoji(code: number): string {
  if (code === 0) return "☀️"
  if (code === 1) return "🌤️"
  if (code === 2) return "⛅"
  if (code === 3) return "☁️"
  if (code === 45 || code === 48) return "🌫️"
  if (code >= 51 && code <= 57) return "🌦️"
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️"
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "🌨️"
  if (code >= 95) return "⛈️"
  return "🌡️"
}
