import { ReserveFormatterFn } from "@galacticcouncil/money-market/types"
import {
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"
import { useCallback } from "react"

import { useAssets } from "@/providers/assetsProvider"

export const useFormatReserve = () => {
  const { getRelatedAToken } = useAssets()

  return useCallback<ReserveFormatterFn>(
    (reserve) => {
      const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
      if (MONEY_MARKET_STRATEGY_ASSETS.includes(assetId)) {
        const aToken = getRelatedAToken(assetId)
        if (!aToken) return reserve
        return {
          ...reserve,
          name: aToken.name,
          symbol: aToken.symbol,
        }
      }

      return reserve
    },
    [getRelatedAToken],
  )
}
