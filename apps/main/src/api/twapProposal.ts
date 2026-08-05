/**
 * TWAP proposal engine — computes a slice schedule (count + cadence) for an order
 * of any size, so the swap page can offer a working, unrestricted TWAP inline.
 *
 * Two levers:
 *  - N (slice count): impact-based fine slicing (~0.1% price impact per slice),
 *    floored at 3 and capped so slices never fall below the dust threshold.
 *  - period (gap between slices): fee-aware — spaced so a large order doesn't
 *    outrun the Omnipool dynamic fee's decay (which would ramp the fee and make
 *    slices skip). Small orders clamp to the runtime minimum (fast, unchanged).
 *
 * Duration falls out as N × period and is shown to the user as-is (no cap).
 */

/** Floor-hold constant for the Omnipool dynamic asset fee = amplification / decay = 2 / (1/20000). */
export const FEE_HOLD_CONSTANT = 40_000

/**
 * Minimum gap between slices, in blocks — a leeway floor on top of the runtime
 * MinDcaPeriod. The per-slice oracle band uses a 20-block Short EMA; firing
 * slices faster than that window makes consecutive slices share the oracle's
 * memory, so its reference lags the price and slices are more likely to skip
 * under real volatility. Flooring the gap at ~1.5× the oracle window (30 blocks)
 * gives each slice a well-refreshed band reference → real headroom, fewer failed
 * slices, at the cost of a modestly longer schedule. Tune here.
 */
export const MIN_SLICE_GAP = 30

/** Each slice must be at least this fraction of the minimum order budget (matches the SDK dust floor). */
const DUST_BUDGET_FRACTION = 0.2

/** Minimum slices; matches the standalone page's MIN_DCA_ORDERS. */
const MIN_SLICES = 3

export type TwapProposalInput = {
  /** Whole-order price impact, in percent (sign-agnostic; e.g. 7.4 for −7.4%). */
  readonly impactPct: number
  /** Order size, in base units (used only for the dust cap; ratio math is unit-safe). */
  readonly amount: bigint
  /** Minimum order budget in the same base units as `amount` (from getMinimumOrderBudget). */
  readonly minOrderBudget: bigint
  /**
   * The order's flow as a fraction of the Omnipool-hop asset's reserve
   * (omnipool-hop out amount ÷ that asset's reserve). 0 when the route has no
   * Omnipool dynamic-fee hop → pacing collapses to the minimum period.
   */
  readonly poolFraction: number
  /** Runtime MinDcaPeriod, in blocks. */
  readonly minDcaPeriod: number
  /** Block time in ms. */
  readonly blockTimeMs: number
}

export type TwapProposal = {
  /** Number of slices (N). */
  readonly slices: number
  /** Gap between slices, in blocks. */
  readonly periodBlocks: number
  /** Total schedule duration in ms (N × period × blockTime). */
  readonly durationMs: number
}

export const computeTwapProposal = ({
  impactPct,
  amount,
  minOrderBudget,
  poolFraction,
  minDcaPeriod,
  blockTimeMs,
}: TwapProposalInput): TwapProposal => {
  // Dust cap: a slice must be ≥ 20% of the minimum order budget, so we never
  // over-slice a big order into fee-dominated crumbs. Rarely binds for real orders.
  const minSlice =
    (minOrderBudget * BigInt(Math.round(DUST_BUDGET_FRACTION * 100))) / 100n
  const dustCap =
    minSlice > 0n && amount > 0n
      ? Math.max(MIN_SLICES, Number(amount / minSlice))
      : Number.MAX_SAFE_INTEGER

  // Impact-based fine slicing: ~0.1% impact per slice, floored at 3, dust-capped.
  const slices = Math.min(
    Math.max(Math.round(Math.abs(impactPct) * 10), MIN_SLICES),
    dustCap,
  )

  // Fee-aware cadence: hold the Omnipool dynamic fee near its floor. Spreading a
  // fraction f at the floor-hold rate takes K·f blocks total, i.e. K·f/N per slice.
  // Small orders → tiny f → clamps to the runtime minimum (fast, no regression).
  const pacedPeriod =
    poolFraction > 0
      ? Math.ceil((FEE_HOLD_CONSTANT * poolFraction) / slices)
      : 0
  // Respect the runtime minimum, our leeway floor, and the fee-hold cadence.
  const periodBlocks = Math.max(minDcaPeriod, MIN_SLICE_GAP, pacedPeriod)

  return {
    slices,
    periodBlocks,
    durationMs: slices * periodBlocks * blockTimeMs,
  }
}
