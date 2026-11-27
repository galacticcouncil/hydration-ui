import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"

// Destination platforms across the trade tabs: xc-swap's (Market), plus BTC,
// which only xc-intents (TWAP) pays out to
export const XC_PLATFORMS = [
  "hydration",
  "near",
  "zec",
  "btc",
] as const satisfies readonly (XcSwapPlatform | "btc")[]

export type XcPlatform = (typeof XC_PLATFORMS)[number]

export const isHydrationAssetId = (id: string): boolean => {
  if (!/^\d+$/.test(id)) return false

  const value = Number(id)
  return Number.isSafeInteger(value)
}

export const getTradeFeeIntervals = (
  min: number,
  max: number,
  num = 3,
): ReadonlyArray<number> => {
  const { log2 } = Math

  return Array.from(
    { length: num + 1 },
    (_, index) => 2 ** (log2(min) + (index / num) * (log2(max) - log2(min))),
  )
}
