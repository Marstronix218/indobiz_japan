import { CITIES } from "./data"
import type { City } from "./types"

export * from "./types"
export { CITIES }

export function listCities(): City[] {
  return CITIES
}

export function getCity(slug: string): City | undefined {
  return CITIES.find((city) => city.slug === slug)
}
