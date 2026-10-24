/**
 * Builder codes let Hydration take a fee on the fills it sends to Hyperliquid
 * on a user's behalf. The fee is set per order, and the user must first
 * approve a maximum rate for our builder address.
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes
 */

/** Builder fees are denominated in tenths of a basis point (10 = 1bp = 0.01%). */
export const TENTHS_BPS_PER_PERCENT = 1000

/** Hyperliquid caps the builder fee at 0.1% of notional on perps. */
export const MAX_BUILDER_FEE_PERP = 100

/**
 * Hyperliquid caps the builder fee at 1% on spot. It applies to the selling
 * side only — spot buys never carry a builder fee.
 */
export const MAX_BUILDER_FEE_SPOT = 1000

/** A user can hold at most 10 active builder approvals at a time. */
export const MAX_BUILDER_APPROVALS = 10

/** Hyperliquid rejects any order worth less than this, in USDC notional. */
export const MIN_ORDER_NOTIONAL_USD = 10

/**
 * Worst price a market order may fill at, as a percent from the mark. There
 * is no true market order on Hyperliquid — see `marketLimitPrice`.
 */
export const DEFAULT_MARKET_SLIPPAGE_PCT = 3

/**
 * Formats a fee in tenths of a basis point as the percent string that
 * `approveBuilderFee` expects, e.g. 100 -> "0.1%".
 */
export const tenthsBpsToPercent = (tenthsBps: number): `${string}%` => {
  const percent = (tenthsBps / TENTHS_BPS_PER_PERCENT)
    .toFixed(3)
    .replace(/\.?0+$/, "")

  return `${percent}%`
}
