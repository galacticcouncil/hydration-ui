import { unPrefixSymbol } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { ASSET_METADATA_OVERRIDES } from "utils/assets"
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

const assetOverridesEntries = Object.entries(ASSET_METADATA_OVERRIDES)
const underlyingAssetMapEntries = assetOverridesEntries.map(
  ([assetId, overrides]) => [
    getAddressFromAssetId(assetId),
    {
      name: overrides.name,
      symbol: overrides.symbol,
      iconSymbol: overrides.symbol ?? "",
    },
  ],
)

const underlyingAssetMap: Record<string, IconMapInterface> = Object.fromEntries(
  underlyingAssetMapEntries,
)

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
