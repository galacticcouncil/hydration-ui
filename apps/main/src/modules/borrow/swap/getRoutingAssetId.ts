import {
  getAssetIdFromAddress,
  HOLLAR_ASSET_ID,
  stringEquals,
} from "@galacticcouncil/utils"

import { TErc20, TErc20AToken } from "@/api/assets"
import { AssetId, TAsset } from "@/providers/assetsProvider"

type GetAsset = (id: AssetId) => TAsset | undefined
type GetRelatedAToken = (id: AssetId) => TErc20 | undefined
type IsErc20AToken = (asset: TAsset) => asset is TErc20AToken

// `routeAsAToken` picks which side of an ERC20 aToken to route through.
const resolveRoutingAssetId = (
  underlyingAsset: string,
  getAsset: GetAsset,
  isErc20AToken: IsErc20AToken,
  getRelatedAToken: GetRelatedAToken,
  ghoTokenAddress: string | undefined,
  routeAsAToken: boolean,
): string | undefined => {
  if (
    ghoTokenAddress &&
    stringEquals(underlyingAsset, ghoTokenAddress) &&
    getAsset(HOLLAR_ASSET_ID)
  ) {
    return HOLLAR_ASSET_ID
  }

  const assetId = getAssetIdFromAddress(underlyingAsset.toLowerCase())
  if (!assetId) return undefined

  const asset = getAsset(assetId)
  if (!asset) return undefined

  if (routeAsAToken) {
    if (isErc20AToken(asset)) return asset.id
    return getRelatedAToken(assetId)?.id
  }

  if (isErc20AToken(asset)) return asset.underlyingAssetId
  return asset.id
}

// Maps a reserve's EVM address to the Omnipool-tradable asset ID the router
// expects. aTokens route through their underlying, as in `healthFactorQuery`.
// GHO's address doesn't encode a Hydration ID, so it routes as Hollar.
export const getRoutingAssetId = (
  underlyingAsset: string,
  getAsset: GetAsset,
  isErc20AToken: IsErc20AToken,
  getRelatedAToken: GetRelatedAToken,
  ghoTokenAddress?: string,
): string | undefined =>
  resolveRoutingAssetId(
    underlyingAsset,
    getAsset,
    isErc20AToken,
    getRelatedAToken,
    ghoTokenAddress,
    false,
  )

// Collateral is held as aTokens, so collateral swaps route aToken to aToken
// (aDOT to aPRIME) instead of through the underlying.
export const getCollateralRoutingAssetId = (
  underlyingAsset: string,
  getAsset: GetAsset,
  isErc20AToken: IsErc20AToken,
  getRelatedAToken: GetRelatedAToken,
  ghoTokenAddress?: string,
): string | undefined =>
  resolveRoutingAssetId(
    underlyingAsset,
    getAsset,
    isErc20AToken,
    getRelatedAToken,
    ghoTokenAddress,
    true,
  )
