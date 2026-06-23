import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"

import { TAssetData } from "@/api/assets"
import {
  XcAsset,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"

export const findXcChainAssetPair = (
  pairs: XcChainAssetPair[],
  assetId: string,
  chainKey = HYDRATION_CHAIN_KEY,
): XcChainAssetPair | undefined => {
  const matching = pairs.filter(
    ({ asset }) =>
      (asset.id !== undefined && String(asset.id) === assetId) ||
      asset.key === assetId ||
      asset.oneClickId === assetId,
  )

  return matching.find(({ chain }) => chain.key === chainKey) ?? matching[0]
}

export const getXcSwapBuyAssetOutId = (
  asset: XcAsset | null | undefined,
): string | undefined =>
  asset?.id !== undefined ? String(asset.id) : undefined

export const isXcDestAsset = (
  asset: TAssetData | XcAsset | null | undefined,
): asset is XcAsset => !!asset && "oneClickId" in asset && !!asset.oneClickId

export const sellAssetToXcAsset = (
  asset: TAssetData,
  originAssetMap: Map<string, XcAsset>,
): XcAsset =>
  originAssetMap.get(asset.id) ?? {
    key: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    decimals: asset.decimals,
    logo: asset.iconSrc ?? "",
    id: Number(asset.id),
  }
