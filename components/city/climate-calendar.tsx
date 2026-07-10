import type { CityClimate } from "@/lib/cities"

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

/**
 * 気候カレンダー。RSC（"use client" 不要）。
 *
 * 2つの独立した尺度（気温レンジ・降水量）を1つの軸に重ねない（dual-axis 回避）。
 * それぞれ専用の列・専用の色相を持つ「小さな複数図」として並べる:
 *   - 気温レンジ: bg-accent（サイト全体で強調色として使用中の色相）
 *   - 降水量: bg-chart-3（テーマの chart トークンのうち緑寄りでない寒色 = 「水」の連想）
 * どちらも単一系列（1色）なので凡例ボックスは置かず、見出しの色スウォッチと
 * 数値ラベルで意味を持たせる（色だけに依存しない）。
 */
export function ClimateCalendar({
  climate,
  bestMonths = [],
  avoidMonths = [],
}: {
  climate: CityClimate
  bestMonths?: number[]
  avoidMonths?: number[]
}) {
  const lows = climate.months.map((m) => m.avgLowC)
  const highs = climate.months.map((m) => m.avgHighC)
  const min = Math.floor(Math.min(...lows))
  const max = Math.ceil(Math.max(...highs))
  const span = Math.max(max - min, 1)
  const maxRain = Math.max(...climate.months.map((m) => m.avgRainMm), 1)

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <table className="w-full border-collapse font-mono text-xs">
        <caption className="sr-only">
          月別の平均気温（最低・最高）と平均降水量。表内の数値がすべての値を伝える一次情報で、
          バーは補助的な視覚化。
        </caption>
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="pb-1 text-left font-normal">
              月
            </th>
            <th scope="col" className="pb-1 text-left font-normal">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-accent/70" aria-hidden="true" />
                気温レンジ
              </span>
            </th>
            <th scope="col" className="pb-1 text-right font-normal">
              最低／最高
            </th>
            <th scope="col" className="pb-1 text-left font-normal">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-chart-3/70" aria-hidden="true" />
                降水量
              </span>
            </th>
            <th scope="col" className="pb-1 text-right font-normal">
              mm
            </th>
          </tr>
          {/* 気温レンジ軸の目盛り（最小・最大のみ、罫線は使わずテキストで） */}
          <tr className="text-[9px] text-muted-foreground/70" aria-hidden="true">
            <th scope="col" />
            <td className="pb-2">
              <div className="flex justify-between tabular-nums">
                <span>{min}°C</span>
                <span>{max}°C</span>
              </div>
            </td>
            <td className="pb-2" />
            <td className="pb-2">
              <div className="flex justify-between tabular-nums">
                <span>0</span>
                <span>{Math.round(maxRain)}mm</span>
              </div>
            </td>
            <td className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {climate.months.map((month) => {
            const isBest = bestMonths.includes(month.month)
            const isAvoid = avoidMonths.includes(month.month)
            const tempLeft = ((month.avgLowC - min) / span) * 100
            const tempWidth = ((month.avgHighC - month.avgLowC) / span) * 100
            const rainWidth = (month.avgRainMm / maxRain) * 100
            return (
              <tr key={month.month} className="border-t border-border/50">
                <th scope="row" className="w-10 py-1.5 text-left font-normal">
                  <span className={isBest ? "font-bold text-accent" : isAvoid ? "text-muted-foreground" : ""}>
                    {MONTH_LABELS[month.month - 1]}
                    {isBest && <span className="sr-only">（渡航に適した月）</span>}
                    {isAvoid && <span className="sr-only">（渡航は避けたい月）</span>}
                  </span>
                </th>
                <td className="w-28 py-1.5 pr-3">
                  <div
                    className="relative h-2 w-full rounded-full bg-muted"
                    title={`${month.avgLowC}°〜${month.avgHighC}°C`}
                  >
                    <div
                      className="absolute h-2 rounded-full bg-accent/70"
                      style={{ left: `${tempLeft}%`, width: `${Math.max(tempWidth, 3)}%` }}
                    />
                  </div>
                </td>
                <td className="w-20 py-1.5 pr-4 text-right tabular-nums">
                  {month.avgLowC}°／{month.avgHighC}°
                </td>
                <td className="w-20 py-1.5 pr-3">
                  <div
                    className="relative h-2 w-full rounded-full bg-muted"
                    title={`${month.avgRainMm}mm`}
                  >
                    <div
                      className="absolute h-2 rounded-full bg-chart-3/70"
                      style={{ width: `${Math.max(rainWidth, 3)}%` }}
                    />
                  </div>
                </td>
                <td className="w-14 py-1.5 text-right tabular-nums">
                  <span className={month.avgRainMm >= maxRain * 0.4 ? "font-bold text-foreground" : "text-muted-foreground"}>
                    {month.avgRainMm}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        出典: Open-Meteo（2015〜2024年の実測値を月別に平均）。
        {bestMonths.length > 0 && <> 強調表示は渡航に適した月。</>}
      </p>
    </div>
  )
}
