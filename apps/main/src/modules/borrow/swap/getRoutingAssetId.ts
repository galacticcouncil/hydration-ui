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

/**
 * Shared resolution core for both routing variants below. Decodes the reserve
 * EVM `underlyingAsset` address to a Hydration asset, applying the GHO/Hollar
 * special case and returning `undefined` when nothing matches.
 *
 * `routeAsAToken` selects which leg of an ERC20 aToken to route through:
 * `false` → the underlying (`underlyingAssetId`), `true` → the aToken's own id.
 */
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

/**
 * Resolves a money-market reserve's EVM `underlyingAsset` address to the
 * Hydration numeric asset ID that `sdk.api.router.getBestSell` /
 * `getBestBuy` expect.
 *
 * The reserve address encodes a Hydration asset ID (see
 * `getAssetIdFromAddress` in `@galacticcouncil/utils`). When that asset is an
 * ERC20 aToken we route through its `underlyingAssetId` — the actual
 * Omnipool-tradable asset — exactly as `healthFactorQuery` does (see
 * `apps/main/src/api/aave.ts`). For any other resolvable asset we route
 * through its own ID.
 *
 * GHO reserves use a standalone EVM contract address that does not encode a
 * Hydration asset ID — when `underlyingAsset` matches `ghoTokenAddress` we
 * route through {@link HOLLAR_ASSET_ID} instead.
 *
 * Used by the spot-price quote and the debt-switch flow. Collateral swaps must
 * route aToken → aToken instead — see {@link getCollateralRoutingAssetId}.
 *
 * @returns the routing asset ID, or `undefined` when no asset matches.
 */
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

/**
 * Collateral-swap variant of {@link getRoutingAssetId}. Money-market collateral
 * is held as aTokens, so a collateral swap must route aToken → aToken (e.g.
 * swapping DOT collateral for PRIME routes aDOT → aPRIME). For an ERC20 aToken
 * this returns the aToken's OWN `asset.id` rather than its `underlyingAssetId`.
 *
 * GHO/Hollar handling and the `undefined`-on-no-match contract are identical to
 * {@link getRoutingAssetId}.
 *
 * @returns the aToken routing asset ID, or `undefined` when no asset matches.
 */
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
