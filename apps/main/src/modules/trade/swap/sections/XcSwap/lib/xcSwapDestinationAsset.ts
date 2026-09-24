import { XcSwapAsset } from "@galacticcouncil/xc-swap"

export const findXcSwapDestinationAsset = (
  assets: XcSwapAsset[],
  assetKey: string,
): XcSwapAsset | undefined =>
  assets.find((a) => a.key === assetKey || a.oneClickId === assetKey)
