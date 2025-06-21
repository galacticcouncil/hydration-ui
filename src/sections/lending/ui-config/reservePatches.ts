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
    name: "GIGADOT",
    symbol: "GDOT",
    iconSymbol: "GDOT",
  },
  "0x0000000000000000000000000000000100001068": {
    name: "GIGAETH",
    symbol: "GETH",
    iconSymbol: "GETH",
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
