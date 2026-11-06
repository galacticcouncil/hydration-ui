import { useMoneyMarket } from "@galacticcouncil/money-market/react"
import { useCallback } from "react"

import {
  assetDisplay,
  ReserveDisplay,
  reserveDisplay,
  ReserveDisplayInput,
} from "@/modules/money-market/reserves/reserveDisplay"
import { useAssets } from "@/providers/assetsProvider"

/**
 * The display seam for a list of reserves, or anywhere a hook per reserve
 * cannot be called. The callback keeps its identity until the market or the
 * registry changes.
 */
export const useResolveReserveDisplay = () => {
  const { market } = useMoneyMarket()
  const { getAsset, getRelatedAToken } = useAssets()

  return useCallback(
    (reserve: ReserveDisplayInput): ReserveDisplay =>
      reserveDisplay(reserve, market, { getAsset, getRelatedAToken }),
    [market, getAsset, getRelatedAToken],
  )
}

/** A reserve's name, symbol and logo, as every money-market surface shows them. */
export const useReserveDisplay = (reserve: ReserveDisplayInput) =>
  useResolveReserveDisplay()(reserve)

/**
 * A registry asset named and drawn as the app shows it: a pool share as its
 * aToken (GDOT, not 2-Pool-GDOT). Draw it with `logoId`, not `id`. Needs no
 * reserve data, so it's right before reserves load.
 */
export const useResolveAssetDisplay = () => {
  const { market } = useMoneyMarket()
  const { getAsset, getRelatedAToken, getAssetWithFallback } = useAssets()

  return useCallback(
    (assetId: string) => ({
      ...getAssetWithFallback(assetId),
      logoId: assetId,
      ...assetDisplay(assetId, market, { getAsset, getRelatedAToken }),
    }),
    [market, getAsset, getRelatedAToken, getAssetWithFallback],
  )
}

export type AssetDisplay = ReturnType<ReturnType<typeof useResolveAssetDisplay>>
