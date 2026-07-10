import assert from "node:assert/strict"
import { test } from "node:test"

import { CITIES } from "./data.ts"

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
