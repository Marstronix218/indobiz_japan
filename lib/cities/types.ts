/**
 * 都市データの型。
 *
 * `lib/authors.ts` と同じく静的ロスターであり、Supabase には保存しない。
 * `specialties` / `living` が任意なのは、事実確認が取れなかった項目を
 * 推測で埋めずに落とす方針のため（docs/city-fact-check-2026-07.md 参照）。
 *
 * このファイルは import を持たない。data.test.ts は node の
 * --experimental-strip-types で実行され、@/* パスエイリアスを解決できないため。
 * CityTone は lib/news-data.ts の ImagePlaceholderTone と同一の union だが、
 * 依存を避けるためあえて再定義している。
 */
export type CityTone = "warm" | "cool" | "green" | "default"

export type CitySpecialty = {
  jp: string
  kind: "料理" | "工芸" | "祭事" | "土産"
  note: string
  /**
   * Wikimedia Commons のオープンライセンス画像（任意）。
   * 掲載条件: 被写体が当該名物であることを確認済みで、ライセンス(CC BY/BY-SA/PD)と
   * 作者を imageCredit に明記できるもののみ。適切な画像がなければ省略する。
   * 出典・確認記録は docs/city-fact-check-2026-07.md に残す。
   */
  imageUrl?: string
  /** 例: "Joe Smith · CC BY-SA 4.0 · Wikimedia" */
  imageCredit?: string
}

export type CityLiving = {
  housing?: {
    areas: string[]
    rents: { layout: string; minUsd: number; maxUsd: number }[]
    note: string
  }
  safetyHealth?: {
    safetyNote: string
    hospitals: { name: string; note: string }[]
    healthNote: string
  }
  transport?: {
    fromAirport: string
    inCity: string
    directFlightFromJapan: string
    commuteNote: string
  }
  japaneseCommunity?: {
    association?: string
    schools: string[]
    groceries: string[]
    corporateNote: string
  }
  /** この数値・固有名詞を確認した年月。例: "2026-07" */
  verifiedAt: string
}

/** climate.ts の1ヶ月ぶんの観測平均。判断を含まない。 */
export type ClimateMonth = {
  month: number
  avgHighC: number
  avgLowC: number
  avgRainMm: number
}

export type CityClimate = {
  slug: string
  months: ClimateMonth[]
}

export type City = {
  slug: string
  name: string
  jp: string
  tag: string
  pop: string
  gdp: string
  note: string
  tone: CityTone
  lat: number
  lon: number
  imageUrl?: string
  imageCredit?: string
  /** 渡航適期・回避月。1〜12。互いに重複しない。avoidMonths は空配列可 */
  bestMonths?: number[]
  avoidMonths?: number[]
  specialties?: CitySpecialty[]
  living?: CityLiving
}
