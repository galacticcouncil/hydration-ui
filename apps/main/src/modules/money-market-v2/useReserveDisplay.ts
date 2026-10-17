import { useMoneyMarket } from "@galacticcouncil/money-market-v2/react"
import { useCallback } from "react"

import {
  ReserveDisplay,
  reserveDisplay,
  ReserveDisplayInput,
} from "@/modules/money-market-v2/reserveDisplay"
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

/** A reserve's name, symbol and logo, as every v2 surface shows them. */
export const useReserveDisplay = (reserve: ReserveDisplayInput) =>
  useResolveReserveDisplay()(reserve)
