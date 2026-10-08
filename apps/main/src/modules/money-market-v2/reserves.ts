import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import {
  getAssetIdFromAddress,
  HOLLAR_ASSET_ID,
  MONEY_MARKET_STRATEGY_ASSETS,
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

/**
 * A pool-share reserve (CONTEXT.md). Main market only: the modals that serve
 * these reserves act on no other, so the same asset on another market is an
 * ordinary reserve.
 */
export const isPoolShareReserve = (address: string, market: MarketDescriptor) =>
  market.market === "hydration_v3" &&
  MONEY_MARKET_STRATEGY_ASSETS.includes(reserveAssetId(address, market))

/**
 * Supplied from any asset through a swap, so holding the reserve's own token
 * is not required. Isolated is read from the chain, never listed.
 */
export const isSwapInReserve = (
  reserve: Pick<ReserveSummary, "underlyingAsset" | "isIsolated">,
  market: MarketDescriptor,
) =>
  market.market === "hydration_v3" &&
  (isPoolShareReserve(reserve.underlyingAsset, market) || reserve.isIsolated)
