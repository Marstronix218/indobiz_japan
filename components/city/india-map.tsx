import Link from "next/link"

import { INDIA_PATH, MAP_HEIGHT, MAP_WIDTH, projectToMap } from "@/lib/cities/india-map"
import type { City } from "@/lib/cities/types"

/**
 * ラベルの逃がし方向。マーカーが近接する都市（デリー/グルガオン、
 * ムンバイ/プネ、ベンガルール/チェンナイ）が重ならないよう都市ごとに固定。
 */
const LABEL_SIDE: Record<string, "right" | "left"> = {
  mumbai: "left",
  "delhi-ncr": "right",
  gurgaon: "left",
  bengaluru: "left",
  chennai: "right",
  pune: "right",
  hyderabad: "right",
  ahmedabad: "right",
  // コルカタは東端に位置し、右向きラベルだと狭い画面で地図カードからはみ出す
  kolkata: "left",
}

/** デリー首都圏とグルガオンは実座標が近すぎて重なるため、表示上だけ上下に離す（SVG単位） */
const MARKER_NUDGE_Y: Record<string, number> = {
  "delhi-ncr": -4,
  gurgaon: 4,
}

/**
 * インド全図に9都市のマーカーを重ねたナビゲーション地図。
 * 輪郭SVGは装飾（aria-hidden）とし、マーカーは HTML の Link を
 * パーセント座標で重ねる — クライアント遷移とフォーカスリングを保つため。
 */
export function IndiaMap({ cities }: { cities: City[] }) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="h-auto w-full"
        aria-hidden="true"
      >
        <path
          d={INDIA_PATH}
          className="fill-muted stroke-border"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {cities.map((city) => {
        const { x, y: rawY } = projectToMap(city.lat, city.lon)
        const y = rawY + (MARKER_NUDGE_Y[city.slug] ?? 0)
        const side = LABEL_SIDE[city.slug] ?? "right"
        return (
          <Link
            key={city.slug}
            href={`/city/${city.slug}`}
            aria-label={`${city.jp}の都市データ`}
            className="group absolute flex -translate-y-1/2 items-center gap-1"
            style={{
              left: `${(x / MAP_WIDTH) * 100}%`,
              top: `${(y / MAP_HEIGHT) * 100}%`,
              transform: `translate(${side === "left" ? "calc(-100% + 5px)" : "-5px"}, -50%)`,
              flexDirection: side === "left" ? "row-reverse" : "row",
            }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-background bg-accent shadow-sm transition-transform group-hover:scale-150" />
            <span className="whitespace-nowrap font-mono text-[10px] leading-none text-muted-foreground transition-colors group-hover:text-accent group-hover:underline">
              {city.jp}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
