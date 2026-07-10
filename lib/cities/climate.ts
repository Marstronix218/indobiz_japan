/**
 * 月別気候平年値。Open-Meteo Archive API の 2015-01-01〜2024-12-31 実測を集計した生成物。
 *
 * scripts/fetch-city-climate.mjs で再生成する。手で編集しないこと。
 * 観測値のみを持ち、渡航適期などの判断は含まない（判断は data.ts 側）。
 */
import type { CityClimate } from "./types"

export const CLIMATE: CityClimate[] = [
  {
    "slug": "mumbai",
    "months": [
      {
        "month": 1,
        "avgHighC": 29.2,
        "avgLowC": 18.5,
        "avgRainMm": 1
      },
      {
        "month": 2,
        "avgHighC": 30.8,
        "avgLowC": 19.6,
        "avgRainMm": 1
      },
      {
        "month": 3,
        "avgHighC": 32.2,
        "avgLowC": 22.1,
        "avgRainMm": 3
      },
      {
        "month": 4,
        "avgHighC": 32.9,
        "avgLowC": 24.6,
        "avgRainMm": 0
      },
      {
        "month": 5,
        "avgHighC": 32.9,
        "avgLowC": 27,
        "avgRainMm": 34
      },
      {
        "month": 6,
        "avgHighC": 30.1,
        "avgLowC": 26.5,
        "avgRainMm": 452
      },
      {
        "month": 7,
        "avgHighC": 28,
        "avgLowC": 25.6,
        "avgRainMm": 781
      },
      {
        "month": 8,
        "avgHighC": 27.9,
        "avgLowC": 25.3,
        "avgRainMm": 435
      },
      {
        "month": 9,
        "avgHighC": 28.5,
        "avgLowC": 25.1,
        "avgRainMm": 430
      },
      {
        "month": 10,
        "avgHighC": 31,
        "avgLowC": 24.5,
        "avgRainMm": 106
      },
      {
        "month": 11,
        "avgHighC": 32.3,
        "avgLowC": 22.3,
        "avgRainMm": 6
      },
      {
        "month": 12,
        "avgHighC": 30.6,
        "avgLowC": 20.4,
        "avgRainMm": 16
      }
    ]
  },
  {
    "slug": "delhi-ncr",
    "months": [
      {
        "month": 1,
        "avgHighC": 19.1,
        "avgLowC": 7.8,
        "avgRainMm": 33
      },
      {
        "month": 2,
        "avgHighC": 23.7,
        "avgLowC": 10.9,
        "avgRainMm": 21
      },
      {
        "month": 3,
        "avgHighC": 29.2,
        "avgLowC": 15.7,
        "avgRainMm": 33
      },
      {
        "month": 4,
        "avgHighC": 36.2,
        "avgLowC": 21.5,
        "avgRainMm": 11
      },
      {
        "month": 5,
        "avgHighC": 38.9,
        "avgLowC": 25.2,
        "avgRainMm": 35
      },
      {
        "month": 6,
        "avgHighC": 38.3,
        "avgLowC": 27.6,
        "avgRainMm": 65
      },
      {
        "month": 7,
        "avgHighC": 33.6,
        "avgLowC": 26.6,
        "avgRainMm": 249
      },
      {
        "month": 8,
        "avgHighC": 32.5,
        "avgLowC": 26,
        "avgRainMm": 164
      },
      {
        "month": 9,
        "avgHighC": 32.6,
        "avgLowC": 24.6,
        "avgRainMm": 119
      },
      {
        "month": 10,
        "avgHighC": 32,
        "avgLowC": 19.8,
        "avgRainMm": 18
      },
      {
        "month": 11,
        "avgHighC": 27,
        "avgLowC": 14.6,
        "avgRainMm": 6
      },
      {
        "month": 12,
        "avgHighC": 21.5,
        "avgLowC": 9.3,
        "avgRainMm": 7
      }
    ]
  },
  {
    "slug": "gurgaon",
    "months": [
      {
        "month": 1,
        "avgHighC": 19,
        "avgLowC": 7.1,
        "avgRainMm": 33
      },
      {
        "month": 2,
        "avgHighC": 23.5,
        "avgLowC": 10.2,
        "avgRainMm": 14
      },
      {
        "month": 3,
        "avgHighC": 28.9,
        "avgLowC": 14.9,
        "avgRainMm": 32
      },
      {
        "month": 4,
        "avgHighC": 35.8,
        "avgLowC": 20.8,
        "avgRainMm": 10
      },
      {
        "month": 5,
        "avgHighC": 38.7,
        "avgLowC": 24.8,
        "avgRainMm": 37
      },
      {
        "month": 6,
        "avgHighC": 38.2,
        "avgLowC": 27.5,
        "avgRainMm": 59
      },
      {
        "month": 7,
        "avgHighC": 33.8,
        "avgLowC": 26.6,
        "avgRainMm": 209
      },
      {
        "month": 8,
        "avgHighC": 32.7,
        "avgLowC": 26,
        "avgRainMm": 153
      },
      {
        "month": 9,
        "avgHighC": 32.9,
        "avgLowC": 24.4,
        "avgRainMm": 109
      },
      {
        "month": 10,
        "avgHighC": 32.2,
        "avgLowC": 19.5,
        "avgRainMm": 15
      },
      {
        "month": 11,
        "avgHighC": 27,
        "avgLowC": 14,
        "avgRainMm": 6
      },
      {
        "month": 12,
        "avgHighC": 21.3,
        "avgLowC": 8.5,
        "avgRainMm": 7
      }
    ]
  },
  {
    "slug": "bengaluru",
    "months": [
      {
        "month": 1,
        "avgHighC": 27.4,
        "avgLowC": 15.5,
        "avgRainMm": 12
      },
      {
        "month": 2,
        "avgHighC": 29.9,
        "avgLowC": 16.3,
        "avgRainMm": 4
      },
      {
        "month": 3,
        "avgHighC": 32.5,
        "avgLowC": 19,
        "avgRainMm": 15
      },
      {
        "month": 4,
        "avgHighC": 33.6,
        "avgLowC": 21.1,
        "avgRainMm": 32
      },
      {
        "month": 5,
        "avgHighC": 31.5,
        "avgLowC": 21.2,
        "avgRainMm": 119
      },
      {
        "month": 6,
        "avgHighC": 28.2,
        "avgLowC": 20.3,
        "avgRainMm": 138
      },
      {
        "month": 7,
        "avgHighC": 27,
        "avgLowC": 19.8,
        "avgRainMm": 165
      },
      {
        "month": 8,
        "avgHighC": 27.1,
        "avgLowC": 19.6,
        "avgRainMm": 145
      },
      {
        "month": 9,
        "avgHighC": 27.1,
        "avgLowC": 19.3,
        "avgRainMm": 145
      },
      {
        "month": 10,
        "avgHighC": 27.4,
        "avgLowC": 18.6,
        "avgRainMm": 141
      },
      {
        "month": 11,
        "avgHighC": 26.7,
        "avgLowC": 17.8,
        "avgRainMm": 109
      },
      {
        "month": 12,
        "avgHighC": 26.3,
        "avgLowC": 16.5,
        "avgRainMm": 37
      }
    ]
  },
  {
    "slug": "chennai",
    "months": [
      {
        "month": 1,
        "avgHighC": 28,
        "avgLowC": 21.8,
        "avgRainMm": 27
      },
      {
        "month": 2,
        "avgHighC": 29.6,
        "avgLowC": 21.9,
        "avgRainMm": 5
      },
      {
        "month": 3,
        "avgHighC": 31.8,
        "avgLowC": 24,
        "avgRainMm": 9
      },
      {
        "month": 4,
        "avgHighC": 33.7,
        "avgLowC": 26.5,
        "avgRainMm": 12
      },
      {
        "month": 5,
        "avgHighC": 35.1,
        "avgLowC": 27.8,
        "avgRainMm": 81
      },
      {
        "month": 6,
        "avgHighC": 35.2,
        "avgLowC": 27.7,
        "avgRainMm": 70
      },
      {
        "month": 7,
        "avgHighC": 33.9,
        "avgLowC": 26.7,
        "avgRainMm": 111
      },
      {
        "month": 8,
        "avgHighC": 33.2,
        "avgLowC": 26.2,
        "avgRainMm": 134
      },
      {
        "month": 9,
        "avgHighC": 32.4,
        "avgLowC": 25.9,
        "avgRainMm": 144
      },
      {
        "month": 10,
        "avgHighC": 30.9,
        "avgLowC": 24.8,
        "avgRainMm": 190
      },
      {
        "month": 11,
        "avgHighC": 28.6,
        "avgLowC": 23.8,
        "avgRainMm": 357
      },
      {
        "month": 12,
        "avgHighC": 28,
        "avgLowC": 22.9,
        "avgRainMm": 171
      }
    ]
  },
  {
    "slug": "pune",
    "months": [
      {
        "month": 1,
        "avgHighC": 28.8,
        "avgLowC": 15.1,
        "avgRainMm": 3
      },
      {
        "month": 2,
        "avgHighC": 31.8,
        "avgLowC": 16.8,
        "avgRainMm": 5
      },
      {
        "month": 3,
        "avgHighC": 34.4,
        "avgLowC": 19.5,
        "avgRainMm": 6
      },
      {
        "month": 4,
        "avgHighC": 37.4,
        "avgLowC": 21.9,
        "avgRainMm": 5
      },
      {
        "month": 5,
        "avgHighC": 36.4,
        "avgLowC": 22.9,
        "avgRainMm": 20
      },
      {
        "month": 6,
        "avgHighC": 30.1,
        "avgLowC": 22.9,
        "avgRainMm": 205
      },
      {
        "month": 7,
        "avgHighC": 26.5,
        "avgLowC": 22.3,
        "avgRainMm": 281
      },
      {
        "month": 8,
        "avgHighC": 26.6,
        "avgLowC": 21.8,
        "avgRainMm": 206
      },
      {
        "month": 9,
        "avgHighC": 27.6,
        "avgLowC": 21.3,
        "avgRainMm": 233
      },
      {
        "month": 10,
        "avgHighC": 29.3,
        "avgLowC": 20.3,
        "avgRainMm": 106
      },
      {
        "month": 11,
        "avgHighC": 29.5,
        "avgLowC": 17.9,
        "avgRainMm": 17
      },
      {
        "month": 12,
        "avgHighC": 28.8,
        "avgLowC": 16.2,
        "avgRainMm": 10
      }
    ]
  },
  {
    "slug": "hyderabad",
    "months": [
      {
        "month": 1,
        "avgHighC": 28.3,
        "avgLowC": 16.2,
        "avgRainMm": 6
      },
      {
        "month": 2,
        "avgHighC": 31.3,
        "avgLowC": 17.9,
        "avgRainMm": 3
      },
      {
        "month": 3,
        "avgHighC": 34.4,
        "avgLowC": 21.1,
        "avgRainMm": 11
      },
      {
        "month": 4,
        "avgHighC": 36.5,
        "avgLowC": 23.8,
        "avgRainMm": 19
      },
      {
        "month": 5,
        "avgHighC": 37.1,
        "avgLowC": 25.7,
        "avgRainMm": 29
      },
      {
        "month": 6,
        "avgHighC": 32.2,
        "avgLowC": 24.3,
        "avgRainMm": 142
      },
      {
        "month": 7,
        "avgHighC": 29.1,
        "avgLowC": 23.1,
        "avgRainMm": 220
      },
      {
        "month": 8,
        "avgHighC": 28.9,
        "avgLowC": 22.8,
        "avgRainMm": 168
      },
      {
        "month": 9,
        "avgHighC": 28.9,
        "avgLowC": 22.4,
        "avgRainMm": 181
      },
      {
        "month": 10,
        "avgHighC": 29.8,
        "avgLowC": 20.9,
        "avgRainMm": 84
      },
      {
        "month": 11,
        "avgHighC": 29.2,
        "avgLowC": 18.7,
        "avgRainMm": 17
      },
      {
        "month": 12,
        "avgHighC": 28.2,
        "avgLowC": 16.9,
        "avgRainMm": 8
      }
    ]
  },
  {
    "slug": "ahmedabad",
    "months": [
      {
        "month": 1,
        "avgHighC": 27.1,
        "avgLowC": 13.6,
        "avgRainMm": 1
      },
      {
        "month": 2,
        "avgHighC": 31,
        "avgLowC": 16.4,
        "avgRainMm": 0
      },
      {
        "month": 3,
        "avgHighC": 35.1,
        "avgLowC": 20.6,
        "avgRainMm": 6
      },
      {
        "month": 4,
        "avgHighC": 39.4,
        "avgLowC": 24.9,
        "avgRainMm": 2
      },
      {
        "month": 5,
        "avgHighC": 41.2,
        "avgLowC": 27.4,
        "avgRainMm": 11
      },
      {
        "month": 6,
        "avgHighC": 37.9,
        "avgLowC": 28,
        "avgRainMm": 84
      },
      {
        "month": 7,
        "avgHighC": 32.4,
        "avgLowC": 26.2,
        "avgRainMm": 442
      },
      {
        "month": 8,
        "avgHighC": 31,
        "avgLowC": 25.3,
        "avgRainMm": 282
      },
      {
        "month": 9,
        "avgHighC": 31.8,
        "avgLowC": 24.8,
        "avgRainMm": 164
      },
      {
        "month": 10,
        "avgHighC": 33.8,
        "avgLowC": 22.7,
        "avgRainMm": 31
      },
      {
        "month": 11,
        "avgHighC": 32,
        "avgLowC": 19.1,
        "avgRainMm": 8
      },
      {
        "month": 12,
        "avgHighC": 28.3,
        "avgLowC": 15.7,
        "avgRainMm": 3
      }
    ]
  },
  {
    "slug": "kolkata",
    "months": [
      {
        "month": 1,
        "avgHighC": 25,
        "avgLowC": 13.3,
        "avgRainMm": 16
      },
      {
        "month": 2,
        "avgHighC": 28.9,
        "avgLowC": 16.9,
        "avgRainMm": 25
      },
      {
        "month": 3,
        "avgHighC": 32.8,
        "avgLowC": 21.4,
        "avgRainMm": 41
      },
      {
        "month": 4,
        "avgHighC": 35.6,
        "avgLowC": 25.3,
        "avgRainMm": 78
      },
      {
        "month": 5,
        "avgHighC": 34.5,
        "avgLowC": 26.6,
        "avgRainMm": 149
      },
      {
        "month": 6,
        "avgHighC": 33.3,
        "avgLowC": 27.2,
        "avgRainMm": 246
      },
      {
        "month": 7,
        "avgHighC": 31.5,
        "avgLowC": 26.3,
        "avgRainMm": 402
      },
      {
        "month": 8,
        "avgHighC": 31.3,
        "avgLowC": 26,
        "avgRainMm": 384
      },
      {
        "month": 9,
        "avgHighC": 31.2,
        "avgLowC": 25.8,
        "avgRainMm": 299
      },
      {
        "month": 10,
        "avgHighC": 30.7,
        "avgLowC": 23.6,
        "avgRainMm": 181
      },
      {
        "month": 11,
        "avgHighC": 28.8,
        "avgLowC": 18.9,
        "avgRainMm": 32
      },
      {
        "month": 12,
        "avgHighC": 25.7,
        "avgLowC": 15,
        "avgRainMm": 29
      }
    ]
  }
]

export function getClimate(slug: string): CityClimate | undefined {
  return CLIMATE.find((entry) => entry.slug === slug)
}
