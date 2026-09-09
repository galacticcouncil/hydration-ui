import { useMemo } from "react"

import { getXcSwapAssetLogoUrl } from "@/modules/trade/swap/sections/XcSwap/config/meta"
import { useXcSwapClient } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapClient"
import { useXcSwapDestinationAssetsQuery } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapDestinationAssetsQuery"
import { findXcSwapDestinationAsset } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapDestinationAsset"

export type XcDestinationAssetDisplay = {
  name: string
  symbol: string
  chainKey: string
  logo: string
}

export const useXcDestinationAsset = (
  assetKey: string | undefined,
): XcDestinationAssetDisplay | undefined => {
  const { xcSwap, chains } = useXcSwapClient()
  const { data: destAssets } = useXcSwapDestinationAssetsQuery(xcSwap)

  return useMemo(() => {
    if (!assetKey || !destAssets) return undefined

    const asset = findXcSwapDestinationAsset(destAssets, assetKey)
    if (!asset) return undefined

    const chain = chains[asset.chain]

    return {
      name: chain?.name ?? asset.symbol,
      symbol: asset.symbol,
      chainKey: asset.chain,
      logo: getXcSwapAssetLogoUrl(asset.chain, asset.symbol),
    }
  }, [assetKey, destAssets, chains])
}
