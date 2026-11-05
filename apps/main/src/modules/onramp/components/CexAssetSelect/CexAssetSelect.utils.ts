import type { AssetConfig } from "@/modules/onramp/types"

export type CexAssetSelectDirection = "deposit" | "withdraw"
export type CexAssetSelectMobileStep = "exchanges" | "assets"

type CexAssetChainConfig = Pick<AssetConfig, "depositChain" | "withdrawalChain">

export const getCexAssetChainKey = (
  asset: CexAssetChainConfig,
  direction: CexAssetSelectDirection,
) => (direction === "deposit" ? asset.depositChain : asset.withdrawalChain)

export const getCexAssetChainKeys = (
  assets: CexAssetChainConfig[],
  direction: CexAssetSelectDirection,
) => [...new Set(assets.map((asset) => getCexAssetChainKey(asset, direction)))]

export const getCexAssetsForChain = <T extends CexAssetChainConfig>(
  assets: T[],
  direction: CexAssetSelectDirection,
  chainKey: string | null,
) =>
  chainKey
    ? assets.filter(
        (asset) => getCexAssetChainKey(asset, direction) === chainKey,
      )
    : assets
