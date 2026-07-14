/**
 * lib/cities/india-map.ts を生成する。
 *
 *   node scripts/generate-india-map.mjs [countries-50m.json のローカルパス]
 *
 * ソースは world-atlas (Natural Earth 50m, パブリックドメイン) のインド輪郭。
 * 国境は Natural Earth の実効支配ベース。等長方形図法（経度は中央緯度の cos で
 * 補正）で SVG 座標へ変換し、都市マーカー用に同じ射影定数を書き出す。
 */

const SOURCE_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
const INDIA_ID = "356"
const MAP_WIDTH = 400
const SIMPLIFY_MIN_DIST = 1.4 // SVG単位。これ未満しか離れていない点は間引く
const MIN_RING_DIAG = 5 // bbox対角がこれ未満の島は描画しない

async function loadTopology() {
  const localPath = process.argv[2]
  if (localPath) {
    const { readFile } = await import("node:fs/promises")
    return JSON.parse(await readFile(localPath, "utf8"))
  }
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
  return res.json()
}

/** TopoJSON の arc（デルタ符号化）を経緯度列へ復元する */
function decodeArcs(topology) {
  const { scale, translate } = topology.transform
  return topology.arcs.map((arc) => {
    let x = 0
    let y = 0
    return arc.map(([dx, dy]) => {
      x += dx
      y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
}

/** arc インデックス列（負値は反転）からリング（経緯度列）を組み立てる */
function stitchRing(arcIndexes, arcs) {
  const ring = []
  for (const index of arcIndexes) {
    const arc = index >= 0 ? arcs[index] : [...arcs[~index]].reverse()
    // 隣接 arc は端点を共有するので、2本目以降は先頭を落とす
    ring.push(...(ring.length ? arc.slice(1) : arc))
  }
  return ring
}

const topology = await loadTopology()
const arcs = decodeArcs(topology)
const india = topology.objects.countries.geometries.find((g) => g.id === INDIA_ID)
if (!india) throw new Error("India (id 356) not found in topology")

const polygons = india.type === "Polygon" ? [india.arcs] : india.arcs
const rings = polygons.flatMap((polygon) => polygon.map((r) => stitchRing(r, arcs)))

// 射影定数（全リングの経緯度バウンディングボックスから決める）
let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity
for (const ring of rings) {
  for (const [lon, lat] of ring) {
    lonMin = Math.min(lonMin, lon); lonMax = Math.max(lonMax, lon)
    latMin = Math.min(latMin, lat); latMax = Math.max(latMax, lat)
  }
}
const cosMid = Math.cos((((latMin + latMax) / 2) * Math.PI) / 180)
const scale = MAP_WIDTH / ((lonMax - lonMin) * cosMid)
const mapHeight = Math.ceil((latMax - latMin) * scale)

const project = ([lon, lat]) => [
  (lon - lonMin) * cosMid * scale,
  (latMax - lat) * scale,
]

/** SVG座標で近接点を間引き、1桁に丸める */
function simplify(points) {
  const kept = []
  for (const point of points) {
    const last = kept[kept.length - 1]
    if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < SIMPLIFY_MIN_DIST) continue
    kept.push(point)
  }
  return kept.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10])
}

const pathParts = []
for (const ring of rings) {
  const projected = simplify(ring.map(project))
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
  for (const [x, y] of projected) {
    xMin = Math.min(xMin, x); xMax = Math.max(xMax, x)
    yMin = Math.min(yMin, y); yMax = Math.max(yMax, y)
  }
  if (Math.hypot(xMax - xMin, yMax - yMin) < MIN_RING_DIAG) continue
  if (projected.length < 4) continue
  pathParts.push(`M${projected.map(([x, y]) => `${x},${y}`).join("L")}Z`)
}

const output = `/**
 * 生成物。手で編集しない。再生成:
 *   node scripts/generate-india-map.mjs
 *
 * ソース: world-atlas countries-50m (Natural Earth, パブリックドメイン)。
 * 国境は Natural Earth の実効支配ベース。
 */

export const MAP_WIDTH = ${MAP_WIDTH}
export const MAP_HEIGHT = ${mapHeight}

/** 生成時と同じ等長方形図法で経緯度を SVG 座標へ変換する */
export function projectToMap(lat: number, lon: number): { x: number; y: number } {
  return {
    x: (lon - ${lonMin}) * ${cosMid} * ${scale},
    y: (${latMax} - lat) * ${scale},
  }
}

export const INDIA_PATH =
  "${pathParts.join("")}"
`

const { writeFile } = await import("node:fs/promises")
await writeFile(new URL("../lib/cities/india-map.ts", import.meta.url), output)
console.log(
  `wrote lib/cities/india-map.ts — ${pathParts.length} rings, path ${pathParts.join("").length} chars, viewBox 0 0 ${MAP_WIDTH} ${mapHeight}`,
)
