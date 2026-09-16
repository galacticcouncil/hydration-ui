import { ENV } from "@/config/env"

export const MAX_PRICE_IMPACT_PCT = 3

// ponytail: one global threshold, make it per-asset if risk ever needs tuning
export const isPriceImpactBlocked = (priceImpactPct: number | undefined) =>
  ENV.VITE_PRICE_IMPACT_LIMIT_ENABLED &&
  Math.abs(priceImpactPct ?? 0) > MAX_PRICE_IMPACT_PCT
