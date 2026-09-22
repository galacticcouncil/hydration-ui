/**
 * Protocol constants shared by the ported math.
 */

/** Aave's year, used to turn a per-annum rate into a per-second one. */
export const SECONDS_PER_YEAR = 31536000n

/**
 * LTV, liquidation threshold and liquidation bonus are basis points on chain,
 * so a big-unit ratio is this many decimal places away from its raw value.
 */
export const LTV_PRECISION = 4

/** Ray is Aave's 27-decimal fixed point; a rate is this far from a ratio. */
export const RAY_DECIMALS = 27

/** The market's USD price feed is quoted with this many decimals. */
export const USD_DECIMALS = 8
