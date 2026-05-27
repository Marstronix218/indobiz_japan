#!/usr/bin/env node
// Fix articles that contain inline citation markers like (参考リンク1) in the body.
// These are a generation quality failure — they should never appear in published text.
//
// Usage: node scripts/fix-inline-citations.mjs [--dry-run]

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local")
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (!m) continue
  if (process.env[m[1]] === undefined) {
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}

const isDryRun = process.argv.includes("--dry-run")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

// Matches: （参考リンク1）（参考資料1）（参考文献1）（ソース1）など
// Handles both full-width and half-width parentheses
const CITATION_PATTERN = /[（(](参考リンク|参考資料|参考文献|ソース)\s*\d+[）)]/g

// Matches trailing meta-commentary like "なお、本文で参照したのは〜である。"
const META_SENTENCE_PATTERN = /なお[、,]本文で参照したのは.+?(\n|$)/g

function stripCitationMarkers(text) {
  return text
    .replace(META_SENTENCE_PATTERN, "")
    .replace(CITATION_PATTERN, "")
    .replace(/。\s+/g, "。")
    .replace(/\s{2,}/g, " ")
    .trim()
}

async function main() {
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "LIVE (will update Supabase)"}`)

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, summary, workflow_status")
    .or("summary.ilike.%(参考リンク%,summary.ilike.%(参考資料%,summary.ilike.%(ソース%")
    .order("published_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Query error:", error)
    process.exit(1)
  }

  const affected = (articles ?? []).filter(
    (a) => a.summary && CITATION_PATTERN.test(a.summary)
  )
  // Reset lastIndex after test
  CITATION_PATTERN.lastIndex = 0

  if (affected.length === 0) {
    console.log("No articles found with inline citation markers.")
    return
  }

  console.log(`Found ${affected.length} article(s) with inline citation markers:\n`)

  for (const article of affected) {
    const fixedSummary = stripCitationMarkers(article.summary)
    console.log(`  ID: ${article.id}`)
    console.log(`  Title: ${article.title}`)
    console.log(`  Status: ${article.workflow_status}`)
    console.log(`  Original length: ${article.summary.length} chars`)
    console.log(`  Fixed length:    ${fixedSummary.length} chars`)
    console.log(`  Sample (first 120): ${fixedSummary.slice(0, 120)}...`)
    console.log()

    if (!isDryRun) {
      const { error: updateError } = await supabase
        .from("articles")
        .update({ summary: fixedSummary })
        .eq("id", article.id)

      if (updateError) {
        console.error(`  ERROR updating ${article.id}:`, updateError)
      } else {
        console.log(`  ✓ Updated article ${article.id}`)
      }
    }
  }

  if (isDryRun) {
    console.log("Dry run complete. Run without --dry-run to apply changes.")
  } else {
    console.log(`Done. ${affected.length} article(s) updated.`)
  }
}

main()
