import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market/types"
import {
  getAssetIdFromAddress,
  HOLLAR_ASSET_ID,
  ISOLATED_MODE_ASSETS,
  MONEY_MARKET_STRATEGY_ASSETS,
  STHDX_ASSET_ID,
} from "@galacticcouncil/utils"

/**
 * The registry asset behind a reserve's token. HOLLAR's token is not an asset
 * precompile, so it can't be decoded from its address. Takes any string, as
 * it also resolves raw URL params.
 */
export const reserveAssetId = (address: string, market: MarketDescriptor) =>
  isHollar(address, market) ? HOLLAR_ASSET_ID : getAssetIdFromAddress(address)

/**
 * Hollar is minted rather than lent: nothing is supplied to its reserve, its
 * rate is set by governance rather than by utilization, and its borrowing is
 * capped by the facilitator bucket instead of the reserve's borrow cap.
 */
export const isHollar = (address: string, market: MarketDescriptor) =>
  address.toLowerCase() === market.addresses.HOLLAR_TOKEN.toLowerCase()

/** stHDX in the GIGAHDX market is withdrawn through staking. */
export const isGigaStakingReserve = (
  address: string,
  market: MarketDescriptor,
) =>
  market.market === "gigahdx_v3" &&
  reserveAssetId(address, market) === STHDX_ASSET_ID

/**
 * A pool-share reserve (see packages/money-market/GLOSSARY.md). Main market
 * only: the modals act on no other market, so the same asset elsewhere is an
 * ordinary reserve.
 */
export const isPoolShareReserve = (address: string, market: MarketDescriptor) =>
  isPoolShareAsset(reserveAssetId(address, market), market)

/** {@link isPoolShareReserve} by registry asset id. */
export const isPoolShareAsset = (assetId: string, market: MarketDescriptor) =>
  market.market === "hydration_v3" &&
  MONEY_MARKET_STRATEGY_ASSETS.includes(assetId)

/**
 * Supplied from any asset through a swap, so holding the reserve's own token
 * is not required. Only configured isolated assets support this flow.
 */
export const isSwapInReserve = (
  reserve: Pick<ReserveSummary, "underlyingAsset" | "isIsolated">,
  market: MarketDescriptor,
) =>
  market.market === "hydration_v3" &&
  (isPoolShareReserve(reserve.underlyingAsset, market) ||
    (reserve.isIsolated &&
      ISOLATED_MODE_ASSETS.includes(
        reserveAssetId(reserve.underlyingAsset, market),
      )))
