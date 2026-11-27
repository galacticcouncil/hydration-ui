import {
  HYDRATION_PARACHAIN_ID,
  SELL_ONLY_ASSETS,
} from "@galacticcouncil/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { HYDRATION } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { assetMetadataQuery } from "@/api/metadata"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcIntentsDestinationsQuery } from "@/api/xcIntents"
import {
  getXcSwapAssetLogoUrl,
  getXcSwapChainLogoUrl,
} from "@/modules/trade/swap/sections/XcSwap/config/meta"
import { addressValidatorForPlatform } from "@/modules/trade/swap/sections/XcSwap/lib/addressValidatorForPlatform"
import { sellAssetToXcAsset } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import {
  XcAsset,
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/types"
import { toXcDestinationPairs } from "@/modules/trade/swap/sections/XcTwap/utils/destinations"
import { TAsset, useAssets } from "@/providers/assetsProvider"

export const DESTINATION_LOGOS = {
  chain: getXcSwapChainLogoUrl,
  asset: getXcSwapAssetLogoUrl,
}

const NO_ORIGIN_ASSETS = new Map<string, XcAsset>()

export const toHydrationXcAsset = (asset: TAsset): XcAsset =>
  sellAssetToXcAsset(asset, NO_ORIGIN_ASSETS)

/** The TWAP tab's To picker: Hydration's buyable assets plus the xc-intents destinations. */
export const useXcTwapAssetPairs = () => {
  const client = useXcIntentsClient()
  const { tradable } = useAssets()
  const { data: metadata } = useQuery(assetMetadataQuery())
  const { data: destinations, isLoading: isDestinationsLoading } = useQuery(
    xcIntentsDestinationsQuery(client),
  )

  const hydrationChain = useMemo<XcChain>(
    () => ({
      ...HYDRATION,
      logo:
        metadata?.getChainLogoSrc(
          HYDRATION_PARACHAIN_ID,
          ChainEcosystem.Polkadot,
        ) ?? "",
      addressValidator: addressValidatorForPlatform(HYDRATION.platform),
    }),
    [metadata],
  )

  const chainAssetPairs = useMemo<XcChainAssetPair[]>(() => {
    const hydrationPairs = tradable
      .filter((asset) => !SELL_ONLY_ASSETS.includes(asset.id))
      .map((asset) => ({
        chain: hydrationChain,
        asset: toHydrationXcAsset(asset),
      }))

    return [
      ...toXcDestinationPairs(destinations ?? [], DESTINATION_LOGOS),
      ...hydrationPairs,
    ]
  }, [destinations, hydrationChain, tradable])

  return { chainAssetPairs, hydrationChain, isDestinationsLoading }
}
