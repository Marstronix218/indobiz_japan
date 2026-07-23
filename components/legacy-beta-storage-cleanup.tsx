"use client"

import { useEffect } from "react"

const LEGACY_BETA_KEYS = [
  "indobiz_start_date",
  "indobiz_extend_date",
  "survey_shown",
]

/** Removes the previous anonymous, device-local beta tracking values. */
export function LegacyBetaStorageCleanup() {
  useEffect(() => {
    try {
      for (const key of LEGACY_BETA_KEYS) {
        window.localStorage.removeItem(key)
      }
    } catch {
      // Storage can be unavailable in strict privacy modes; there is no
      // tracking fallback and access is now determined by the database.
    }
  }, [])

  return null
}
