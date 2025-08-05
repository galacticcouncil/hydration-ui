import { FormattedGhoReserveData } from "@aave/math-utils"
import { TErc20, useAssets } from "providers/assets"
import { useCallback } from "react"
import {
  ComputedReserveData,
  unPrefixSymbol,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { GHO_SYMBOL } from "sections/lending/utils/ghoUtilities"
import { getAssetIdFromAddress } from "utils/evm"
import BN from "bignumber.js"

export interface IconSymbolInterface {
  underlyingAsset: string
  symbol: string
  name?: string
}

interface IconMapInterface {
  iconSymbol: string
  name?: string
  symbol?: string
}

const underlyingAssetMap: Record<string, IconMapInterface> = {}

const patchGhoReserve = (
  reserve: ComputedReserveData,
  ghoReserveData: FormattedGhoReserveData,
) => {
  const borrowCap = BN(ghoReserveData.aaveFacilitatorBucketMaxCapacity)

  return {
    ...reserve,
    borrowCap: borrowCap.toString(),
    borrowCapUSD: borrowCap.times(reserve.priceInUSD).toString(),
  }
}

const patchGigaReserve = (reserve: ComputedReserveData, aToken: TErc20) => ({
  ...reserve,
  name: aToken.name,
  symbol: aToken.symbol,
})

export const usePatchReserve = () => {
  const { getRelatedAToken } = useAssets()

  return useCallback(
    (
      reserve: ComputedReserveData,
      ghoReserveData: FormattedGhoReserveData,
    ): ComputedReserveData => {
      if (reserve.symbol === GHO_SYMBOL) {
        return patchGhoReserve(reserve, ghoReserveData)
      }

      if (MONEY_MARKET_GIGA_RESERVES.includes(reserve.underlyingAsset)) {
        const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
        const aToken = getRelatedAToken(assetId)
        if (!aToken) return reserve
        return patchGigaReserve(reserve, aToken)
      }

      return reserve
    },
    [getRelatedAToken],
  )
}

export function fetchIconSymbolAndName({
  symbol,
  name,
  underlyingAsset,
}: IconSymbolInterface) {
  const unifiedSymbol = unPrefixSymbol(symbol.toUpperCase(), "AMM")

  const lowerUnderlyingAsset = underlyingAsset.toLowerCase()
  if (underlyingAssetMap.hasOwnProperty(lowerUnderlyingAsset)) {
    return {
      symbol,
      ...underlyingAssetMap[lowerUnderlyingAsset],
    }
  }

  return {
    iconSymbol: unifiedSymbol,
    name: name || unifiedSymbol,
    symbol,
  }
}
