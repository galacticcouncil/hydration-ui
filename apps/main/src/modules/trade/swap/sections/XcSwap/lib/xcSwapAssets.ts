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

export type XcSwapDefaultSelection = {
  readonly chainKey: string
  readonly assetId: string
}

export const getDefaultChainAssetPair = (
  pairs: XcChainAssetPair[],
  defaultSelection: XcSwapDefaultSelection,
) =>
  pairs.find(
    ({ chain, asset }) =>
      chain.key === defaultSelection.chainKey &&
      ((asset.id !== undefined &&
        String(asset.id) === defaultSelection.assetId) ||
        asset.key === defaultSelection.assetId ||
        asset.oneClickId === defaultSelection.assetId),
  )

export const getNormalizedXcAssetId = (asset: XcAsset): string =>
  asset.id !== undefined ? String(asset.id) : (asset.oneClickId ?? asset.key)

export const getXcAssetId = (
  asset: XcAsset | null | undefined,
): string | undefined => (asset ? getNormalizedXcAssetId(asset) : undefined)

export const isSameXcAsset = (a: XcAsset, b: XcAsset): boolean =>
  getNormalizedXcAssetId(a) === getNormalizedXcAssetId(b)

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
    logoId: asset.id,
    id: Number(asset.id),
  }
