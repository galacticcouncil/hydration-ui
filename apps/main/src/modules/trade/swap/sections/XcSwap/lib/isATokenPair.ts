import { TAssetsContext } from "@/providers/assetsProvider"

// An aToken and its underlying are always 1:1, so the router swaps them
// directly instead of going through ICE
export const isATokenPair = (
  getErc20AToken: TAssetsContext["getErc20AToken"],
  sellAssetId: string,
  buyAssetId: string,
): boolean =>
  getErc20AToken(sellAssetId)?.underlyingAssetId === buyAssetId ||
  getErc20AToken(buyAssetId)?.underlyingAssetId === sellAssetId
