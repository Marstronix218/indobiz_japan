// 診断専用: clustering.ts の extractKeywords を忠実に移植し、
// 凍結クラスタの「なぜ束ねられたか(共有キーワード)」を可視化する。使い捨て。
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const STOPWORDS = new Set([
  "the","a","an","and","or","but","nor","so","yet","for",
  "of","to","in","on","at","by","from","with","about","as",
  "into","like","through","after","over","between","out","against",
  "during","without","before","under","around","among","off",
  "is","are","was","were","be","been","being","am",
  "has","have","had","having","do","does","did","done",
  "will","would","shall","should","can","could","may","might","must",
  "this","that","these","those","there","here","their","they","them",
  "its","it","his","her","our","your","my","we","you","he","she",
  "who","what","when","where","why","how","which","whose",
  "said","says","told","according","also","more","than","such","per",
  "one","two","three","new","last","first","next","year","years",
  "day","days","week","month","time","since","now","already","still",
  "all","any","some","each","every","few","many","most","other",
  "if","because","while","though","although","unless","until",
  "not","no","only","just","very","too","even","back","up","down",
  "news","report","reports","reuters","pib","google","india","indian",
  "business","economy","economic","market","markets","company","companies",
  "industry","industries","sector","sectors","growth","global","trade",
  "investment","investments","investor","investors","deal","billion","million",
  "share","shares","stock","stocks","price","prices","high","low",
  "government","policy","minister","ministry","official","officials",
  "country","world","international","national","local","state","states",
  "ltd","inc","corp","group","holdings","limited","rupee","rupees",
])
const MIN_TOKEN_LENGTH = 3
const CJK_RUN = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]+/gu
const CJK_CHAR = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]/

function extractKeywords(title, body, n) {
  const weightedText = `${title} ${title} ${title} ${body ?? ""}`
  const rawTokens = weightedText.split(/[\s\n\r\t]+/)
    .map((tk) => tk.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean)
  const scores = new Map()
  for (const raw of rawTokens) {
    if (CJK_CHAR.test(raw)) {
      for (const lr of raw.match(/[A-Za-z0-9]+/g) ?? []) {
        if (lr.length < MIN_TOKEN_LENGTH) continue
        const lower = lr.toLowerCase(); if (STOPWORDS.has(lower)) continue
        const boost = /^[A-Z]/.test(lr) ? 2 : 0
        scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
      }
      continue
    }
    if (raw.length < MIN_TOKEN_LENGTH) continue
    const lower = raw.toLowerCase(); if (STOPWORDS.has(lower)) continue
    const boost = /^[A-Z]/.test(raw) ? 2 : 0
    scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
  }
  for (const run of weightedText.match(CJK_RUN) ?? []) {
    if (run.length < 2) continue
    for (let i = 0; i < run.length - 1; i++) {
      const bg = run.slice(i, i + 2); if (STOPWORDS.has(bg)) continue
      scores.set(bg, (scores.get(bg) ?? 0) + 1)
    }
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n).map(([t]) => t)
}

const N = Number(process.env.CLUSTER_KEYWORDS_PER_ARTICLE ?? 12)
const d = JSON.parse(readFileSync(resolve("scripts/experiments/frozen-clusters.json"), "utf8"))

d.clusters.forEach((c, ci) => {
  console.log(`\n========== クラスタ${ci + 1} (${c.length}ソース, keywords=${N}) ==========`)
  const kw = c.map((a) => new Set(extractKeywords(a.title, a.bodyText ?? "", N)))
  c.forEach((a, i) => console.log(`  #${i}: [${a.source}] ${a.title.slice(0, 70)}`))
  console.log("  --- 全ペアの共有キーワード ---")
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) {
      const shared = [...kw[i]].filter((k) => kw[j].has(k))
      const mark = shared.length >= 3 ? "🔗結合" : shared.length === 2 ? "・" : " "
      console.log(`  ${mark} #${i}×#${j}: ${shared.length}語 [${shared.join(", ")}]`)
    }
  }
})
