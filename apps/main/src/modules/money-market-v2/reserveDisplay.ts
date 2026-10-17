import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"

import {
  isPoolShareReserve,
  reserveAssetId,
} from "@/modules/money-market-v2/reserves"

type RegistryAsset = { id: string; name: string; symbol: string }

/** Any string for the address, as the seam also names raw URL params. */
export type ReserveDisplayInput = Pick<ReserveSummary, "symbol" | "name"> & {
  underlyingAsset: string
}

/** The two asset registry lookups the seam reads, as `useAssets` gives them. */
export type ReserveDisplayRegistry = {
  getAsset: (id: string) => RegistryAsset | undefined
  getRelatedAToken: (id: string) => RegistryAsset | undefined
}

export type ReserveDisplay = { name: string; symbol: string; logoId: string }

/**
 * The one place a reserve gets its name, symbol and logo. A pool-share reserve
 * (CONTEXT.md) shows as its aToken, as the rest of the app names it (GDOT, not
 * 2-Pool-GDOT); any other reserve shows as its registry asset, and as the
 * chain names it when the registry has none. A pool-share reserve whose aToken
 * the registry lacks is shown as any other reserve.
 */
export const reserveDisplay = (
  reserve: ReserveDisplayInput,
  market: MarketDescriptor,
  { getAsset, getRelatedAToken }: ReserveDisplayRegistry,
): ReserveDisplay => {
  const assetId = reserveAssetId(reserve.underlyingAsset, market)
  const aToken = isPoolShareReserve(reserve.underlyingAsset, market)
    ? getRelatedAToken(assetId)
    : undefined

  if (aToken) {
    return { name: aToken.name, symbol: aToken.symbol, logoId: aToken.id }
  }

  const asset = getAsset(assetId)

  return {
    name: asset?.name ?? reserve.name,
    symbol: asset?.symbol ?? reserve.symbol,
    logoId: assetId,
  }
}
