import {
  ComputedReserveData,
  unPrefixSymbol,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import {
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
} from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

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

const gigaReserveAssetMap: Record<string, IconMapInterface> = {
  [getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID)]: {
    name: "GIGADOT",
    symbol: "GDOT",
    iconSymbol: "GDOT",
  },
  [getAddressFromAssetId(GETH_STABLESWAP_ASSET_ID)]: {
    name: "GIGAETH",
    symbol: "GETH",
    iconSymbol: "GETH",
  },
}

export const patchGigaReserveSymbolAndName = ({
  symbol,
  name,
  underlyingAsset,
}: ComputedReserveData): IconMapInterface => {
  const lowerUnderlyingAsset = underlyingAsset.toLowerCase()
  if (gigaReserveAssetMap.hasOwnProperty(lowerUnderlyingAsset)) {
    return gigaReserveAssetMap[lowerUnderlyingAsset]
  }

  return {
    name,
    symbol,
    iconSymbol: symbol,
  }
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
