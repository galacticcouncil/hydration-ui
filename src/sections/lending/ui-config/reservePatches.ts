import { unPrefixSymbol } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export interface IconSymbolInterface {
  underlyingAsset: string
  symbol: string
  name?: string
}

export function fetchIconSymbolAndName({ symbol, name }: IconSymbolInterface) {
  const unifiedSymbol = unPrefixSymbol(symbol.toUpperCase(), "AMM")
  return {
    iconSymbol: unifiedSymbol,
    name: name || unifiedSymbol,
    symbol,
  }
}
