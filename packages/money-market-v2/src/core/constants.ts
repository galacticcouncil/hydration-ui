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

/**
 * `type(uint256).max` — the pool's own sentinel for "all of it". Callers pass
 * it through as an amount rather than resolving a balance, which would race
 * with interest accrual between planning and submission (ADR-0007).
 */
export const MAX_UINT_AMOUNT = 2n ** 256n - 1n

/** Hollar, like the GHO it forks, is an 18-decimal token. */
export const HOLLAR_DECIMALS = 18

/**
 * A projected health factor below this with debt outstanding is liquidatable,
 * which is where the pool itself reverts — the same blocker for every action.
 */
export const HF_BLOCKER_THRESHOLD = "1"

/** Below this the action may proceed only once the user accepts the risk. */
export const HF_ACKNOWLEDGEMENT_THRESHOLD = "1.1"

/** The health factor a computed maximum leaves behind, never lower. */
export const HF_MAX_TARGET = "1.01"
