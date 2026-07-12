import assert from "node:assert/strict"
import { test } from "node:test"

import { CITIES } from "./data.ts"
import { CLIMATE, getClimate } from "./climate.ts"

test("9都市が存在する", () => {
  assert.equal(CITIES.length, 9)
})

test("slug がユニーク", () => {
  const slugs = CITIES.map((c) => c.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})

test("全都市が必須の基本フィールドを持つ", () => {
  for (const city of CITIES) {
    assert.ok(city.slug, `${city.name}: slug`)
    assert.ok(city.jp, `${city.name}: jp`)
    assert.ok(city.tag, `${city.name}: tag`)
    assert.ok(city.pop, `${city.name}: pop`)
    assert.ok(city.gdp, `${city.name}: gdp`)
    assert.ok(city.note, `${city.name}: note`)
    assert.equal(typeof city.lat, "number", `${city.name}: lat`)
    assert.equal(typeof city.lon, "number", `${city.name}: lon`)
  }
})

test("mumbai の slug が引ける", () => {
  assert.equal(CITIES.find((city) => city.slug === "mumbai")?.jp, "ムンバイ")
})

test("climate は全 slug × 12ヶ月を持つ", () => {
  assert.equal(CLIMATE.length, CITIES.length)
  for (const city of CITIES) {
    const climate = getClimate(city.slug)
    if (!climate) throw new Error(`${city.slug}: climate なし`)
    assert.equal(climate.months.length, 12, `${city.slug}: 月数`)
    const months = climate.months.map((m) => m.month)
    assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  }
})

test("climate の値が現実的な範囲に収まる", () => {
  for (const climate of CLIMATE) {
    for (const m of climate.months) {
      assert.ok(m.avgLowC <= m.avgHighC, `${climate.slug}/${m.month}: low > high`)
      assert.ok(m.avgHighC > 0 && m.avgHighC < 55, `${climate.slug}/${m.month}: high 異常`)
      assert.ok(m.avgRainMm >= 0, `${climate.slug}/${m.month}: rain 負値`)
    }
  }
})

test("ムンバイの降水量が日別平均ではなく月間合計の平均になっている", () => {
  const climate = getClimate("mumbai")
  if (!climate) throw new Error("mumbai: climate なし")
  const julyMonth = climate.months.find((m) => m.month === 7)
  const januaryMonth = climate.months.find((m) => m.month === 1)
  if (!julyMonth) throw new Error("mumbai: July なし")
  if (!januaryMonth) throw new Error("mumbai: January なし")
  // 日別平均では約26mm（781/30）となり、この値は300を下回る
  assert.ok(
    julyMonth.avgRainMm > 300,
    `mumbai July rainfall: expected > 300mm, got ${julyMonth.avgRainMm}`
  )
  // 季節風と乾季の降雨量比が50倍以上であることを検証（日別平均では26倍程度に縮む）
  assert.ok(
    julyMonth.avgRainMm >= januaryMonth.avgRainMm * 50,
    `mumbai July/January ratio: expected >= 50, got ${julyMonth.avgRainMm / januaryMonth.avgRainMm}`
  )
})

// Task 6〜14 のファクトチェックでは、裏付けが取れない項目は推測で埋めず削除する方針だった
// （docs/city-fact-check-2026-07.md）。そのため living のサブブロック（housing/safetyHealth/
// transport/japaneseCommunity）や japaneseCommunity.groceries/schools は都市ごとに有無が
// 異なる。ここでは「常に成り立つべきこと」だけを検証し、サブブロックの存在は主張しない。
test("全都市が specialties と living を持つ", () => {
  for (const city of CITIES) {
    assert.ok(city.specialties?.length, `${city.slug}: specialties`)
    const living = city.living
    if (!living) throw new Error(`${city.slug}: living なし`)
    assert.equal(living.verifiedAt, "2026-07", `${city.slug}: verifiedAt`)
  }
})

// avoidMonths は「存在すること」のみ検証し、空配列であることは許容する
// （bengaluru の avoidMonths: [] は査読済みの正しいデータであり、非空を要求してはならない）。
test("全都市が bestMonths / avoidMonths を持ち 1-12 で重複しない", () => {
  for (const city of CITIES) {
    const { bestMonths, avoidMonths } = city
    if (!bestMonths?.length) throw new Error(`${city.slug}: bestMonths なし`)
    if (!avoidMonths) throw new Error(`${city.slug}: avoidMonths なし`)
    for (const month of [...bestMonths, ...avoidMonths]) {
      assert.ok(month >= 1 && month <= 12, `${city.slug}: ${month} が範囲外`)
    }
    const overlap = bestMonths.filter((month) => avoidMonths.includes(month))
    assert.deepEqual(overlap, [], `${city.slug}: bestMonths と avoidMonths が重複`)
  }
})

test("家賃レンジは minUsd <= maxUsd", () => {
  for (const city of CITIES) {
    for (const rent of city.living?.housing?.rents ?? []) {
      assert.ok(rent.minUsd <= rent.maxUsd, `${city.slug}/${rent.layout}`)
      assert.ok(rent.minUsd > 0, `${city.slug}/${rent.layout}: minUsd が 0 以下`)
    }
  }
})
