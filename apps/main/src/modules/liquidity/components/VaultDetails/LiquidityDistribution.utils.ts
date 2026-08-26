import { V3PoolBase } from "@/api/pools"
import { VaultState } from "@/api/vaults"

/** token1 per token0, decimal-adjusted, from a tick */
export const priceAtTick = (
  tick: number,
  decimals0: number,
  decimals1: number,
) => Math.pow(1.0001, tick) * Math.pow(10, decimals0 - decimals1)

/** raw sqrt(token1/token0) at a tick, before decimals */
const sqrtRatioAtTick = (tick: number) => Math.pow(1.0001, tick / 2)

/**
 * Token the range actually holds. Below the spot tick a range is all token1,
 * above it all token0 — the standard v3 single-sided amounts.
 */
const lockedAmount = (
  liquidity: number,
  lower: number,
  upper: number,
  side: "token0" | "token1",
  decimals0: number,
  decimals1: number,
) =>
  side === "token1"
    ? (liquidity * (sqrtRatioAtTick(upper) - sqrtRatioAtTick(lower))) /
      Math.pow(10, decimals1)
    : (liquidity * (1 / sqrtRatioAtTick(lower) - 1 / sqrtRatioAtTick(upper))) /
      Math.pow(10, decimals0)

/**
 * One painted slice. A range of constant liquidity is cut into several slices
 * purely so the chart reads as a histogram; every slice of a range carries the
 * same height and the same range bounds, so the tooltip is identical whichever
 * one the pointer lands on.
 */
export type Bar = {
  from: number
  to: number
  liquidity: number
  side: "token0" | "token1"
  /** bounds of the range this slice was cut from */
  rangeFrom: number
  rangeTo: number
  /** token amount the whole range holds, in the `side` token */
  locked: number
  /** the range the spot tick falls in */
  current: boolean
}

/** A keeper range drawn behind the bars */
type Band = {
  lower: number
  upper: number
  opacity: number
  /** share of the plot height, so overlapping bands stay tellable apart */
  height: number
}

/** Which step of the managed-range lifecycle the chart illustrates */
export type RangeScenario = "inRange" | "outOfRange" | "recentered"

export const BARS_ID = "liquidity-bars"
/** slices across the whole window; each range gets its proportional share */
const SLICE_TARGET = 30

/** Bands and labels emit focus points too, so only bars may open a tooltip */
export const isBarPoint = <TPoint extends { markId: string; datum: unknown }>(
  point: TPoint,
): point is TPoint & { datum: Bar } => point.markId === BARS_ID

export const isSameRange = (
  focused: { markId: string; datum: unknown },
  bar: Bar,
) =>
  !isBarPoint(focused) ||
  (focused.datum.rangeFrom === bar.rangeFrom &&
    focused.datum.rangeTo === bar.rangeTo)

// Initialised ticks accumulate into active-liquidity ranges — liquidity is
// constant between two initialised ticks — which are then sliced for looks only.
export const getLiquidityDistribution = ({
  pool,
  state,
  decimals0,
  decimals1,
  scenario,
}: {
  pool: V3PoolBase
  state: VaultState | null
  decimals0: number
  decimals1: number
  /** set to walk through the lifecycle: the depth is real, the price is staged */
  scenario?: RangeScenario
}) => {
  const ticks = [...(pool.ticks ?? [])].sort((a, b) => a.index - b.index)
  const marketSpot = pool.tick
  const bandWidth = state ? state.baseUpper - state.baseLower : 0
  const from =
    state && bandWidth > 0
      ? Math.min(state.baseLower, marketSpot) - bandWidth
      : marketSpot - 3000
  const to =
    state && bandWidth > 0
      ? Math.max(state.baseUpper, marketSpot) + bandWidth
      : marketSpot + 3000
  const span = to - from

  // The illustration keeps the pool's real depth and window, and only stages
  // where the price sits and which band the keeper is holding.
  const base =
    state && bandWidth > 0
      ? { lower: state.baseLower, upper: state.baseUpper }
      : { lower: from + span * 0.34, upper: from + span * 0.7 }
  const halfBand = (base.upper - base.lower) / 2
  const outside = Math.min(to - span * 0.05, base.upper + span * 0.12)
  const inside =
    marketSpot >= base.lower && marketSpot <= base.upper
      ? marketSpot
      : base.lower + halfBand
  const staged = { inRange: inside, outOfRange: outside, recentered: outside }
  const spot = scenario ? staged[scenario] : marketSpot

  const recentered = {
    lower: Math.max(from + span * 0.02, outside - halfBand),
    upper: Math.min(to - span * 0.02, outside + halfBand),
  }

  // faded band first so the live one paints over it
  const bands: ReadonlyArray<Band> =
    scenario === "recentered"
      ? [
          { ...base, opacity: 0.25, height: 1.05 },
          { ...recentered, opacity: 0.6, height: 1.05 },
        ]
      : scenario
        ? [{ ...base, opacity: 0.6, height: 1.05 }]
        : [
            ...(state && bandWidth > 0
              ? [{ ...base, opacity: 0.6, height: 1.05 }]
              : []),
            ...(state && state.limitUpper > state.limitLower
              ? [
                  {
                    lower: state.limitLower,
                    upper: state.limitUpper,
                    opacity: 0.6,
                    height: 1,
                  },
                ]
              : []),
          ]

  let running = pool.liquidity
  for (const tick of ticks) {
    if (tick.index <= marketSpot) running -= tick.liquidityNet
  }

  const out: Bar[] = []
  const sliceWidth = (to - from) / SLICE_TARGET
  const push = (
    left: number,
    right: number,
    liquidity: number,
    side: Bar["side"],
    current: boolean,
  ) => {
    const locked = lockedAmount(
      liquidity,
      left,
      right,
      side,
      decimals0,
      decimals1,
    )
    const count = Math.max(1, Math.round((right - left) / sliceWidth))
    const step = (right - left) / count

    for (let slice = 0; slice < count; slice++) {
      out.push({
        from: left + slice * step,
        to: left + (slice + 1) * step,
        liquidity,
        side,
        rangeFrom: left,
        rangeTo: right,
        locked,
        current,
      })
    }
  }

  for (let i = 0; i < ticks.length - 1; i++) {
    const tick = ticks[i]
    const next = ticks[i + 1]
    if (!tick || !next) continue

    running += tick.liquidityNet
    if (running <= 0n) continue

    const left = Math.max(tick.index, from)
    const right = Math.min(next.index, to)
    if (right <= left) continue

    const liquidity = Number(running)

    const current = left <= spot && right > spot

    if (left < spot && right > spot) {
      push(left, spot, liquidity, "token1", current)
      push(spot, right, liquidity, "token0", current)
    } else {
      push(left, right, liquidity, right <= spot ? "token1" : "token0", current)
    }
  }

  return {
    bars: out,
    spotTick: spot,
    max: out.reduce((value, bar) => Math.max(value, bar.liquidity), 0),
    lo: from,
    hi: to,
    bands,
  }
}
