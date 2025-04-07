import { unPrefixSymbol } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

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

const underlyingAssetMap: Record<string, IconMapInterface> = {
  "0x00000000000000000000000000000001000002b2": {
    name: "gigaDOT",
    symbol: "gigaDOT",
    iconSymbol: "gigaDOT",
  },
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
