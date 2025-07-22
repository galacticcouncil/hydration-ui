import { useAssets } from "providers/assets"
import { useCallback } from "react"
import {
  ComputedReserveData,
  unPrefixSymbol,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { getAssetIdFromAddress } from "utils/evm"

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

export const usePatchReserve = () => {
  const { getRelatedAToken } = useAssets()

  return useCallback(
    (reserve: ComputedReserveData): ComputedReserveData => {
      if (!MONEY_MARKET_GIGA_RESERVES.includes(reserve.underlyingAsset))
        return reserve

      const aToken = getRelatedAToken(
        getAssetIdFromAddress(reserve.underlyingAsset),
      )
      if (!aToken) return reserve

      return {
        ...reserve,
        name: aToken.name,
        symbol: aToken.symbol,
      }
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
