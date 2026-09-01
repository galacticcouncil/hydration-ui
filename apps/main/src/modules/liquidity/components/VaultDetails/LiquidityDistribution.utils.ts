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
  /** stable identity used to animate chart updates */
  key: string
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
  id: "active" | "previous" | "base" | "limit"
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

/** A range the vault actually holds liquidity in. Bounds alone are not enough:
 *  rebalance sets them every run and may mint nothing into either one. */
export const hasBase = (state: VaultState) =>
  state.baseUpper > state.baseLower && state.base.liquidity > 0n

export const hasLimit = (state: VaultState) =>
  state.limitUpper > state.limitLower && state.limit.liquidity > 0n

export const getManagedBand = (
  tick: number,
  state: VaultState,
): "base" | "limit" | null => {
  // rebalance only forbids limit and base sharing both bounds, so they may
  // overlap. The limit range is the narrower, more specific one, so it wins.
  if (hasLimit(state) && tick >= state.limitLower && tick <= state.limitUpper)
    return "limit"

  if (hasBase(state) && tick >= state.baseLower && tick <= state.baseUpper)
    return "base"

  return null
}

export const sharesFocusGroup = (
  focused: { markId: string; datum: unknown },
  bar: Bar,
  state: VaultState | null,
) => {
  if (!isBarPoint(focused)) return true
  if (isSameRange(focused, bar)) return true
  if (!state) return false

  const mid = (bar: Bar) => (bar.rangeFrom + bar.rangeTo) / 2
  const focusedBand = getManagedBand(mid(focused.datum), state)
  const barBand = getManagedBand(mid(bar), state)

  return focusedBand !== null && focusedBand === barBand
}

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
  /** set to stage the price and managed band over the pool's real depth */
  scenario?: RangeScenario
}) => {
  const ticks = [...(pool.ticks ?? [])].sort((a, b) => a.index - b.index)
  const marketSpot = pool.tick
  const bandWidth = state ? state.baseUpper - state.baseLower : 0
  // The limit range sits next to base, but nothing bounds it to one base width,
  // so it has to be framed explicitly or it lands outside the plot.
  const edges = state
    ? [
        marketSpot,
        ...(bandWidth > 0 ? [state.baseLower, state.baseUpper] : []),
        ...(hasLimit(state) ? [state.limitLower, state.limitUpper] : []),
      ]
    : []
  const pad = bandWidth > 0 ? bandWidth : 3000
  const from = edges.length ? Math.min(...edges) - pad : marketSpot - 3000
  const to = edges.length ? Math.max(...edges) + pad : marketSpot + 3000
  const span = to - from

  // The lifecycle illustration keeps the pool's real depth and price window,
  // then stages where the price and keeper-managed band sit inside it.
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

  // Keep both scenario marks mounted so the active band can glide to its new
  // position and the previous band can fade in behind it.
  const bands: ReadonlyArray<Band> = scenario
    ? [
        {
          id: "previous",
          ...base,
          opacity: scenario === "recentered" ? 0.16 : 0,
          height: 1.05,
        },
        {
          id: "active",
          ...(scenario === "recentered" ? recentered : base),
          opacity: 0.48,
          height: 1.05,
        },
      ]
    : [
        ...(state && hasBase(state)
          ? [{ id: "base" as const, ...base, opacity: 0.6, height: 1.05 }]
          : []),
        ...(state && hasLimit(state)
          ? [
              {
                id: "limit" as const,
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
  // Keep the explainer's bar geometry anchored to the real market tick. The
  // staged price may recolour slices, but it must not resize or repartition
  // the pool-depth histogram as the user switches lifecycle states.
  const geometrySpot = scenario ? marketSpot : spot
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
      const sliceFrom = left + slice * step
      const sliceTo = left + (slice + 1) * step
      const stagedSide =
        scenario && (sliceFrom + sliceTo) / 2 > spot ? "token0" : "token1"

      out.push({
        key: `${left}-${right}-${slice}`,
        from: sliceFrom,
        to: sliceTo,
        liquidity,
        side: scenario ? stagedSide : side,
        rangeFrom: left,
        rangeTo: right,
        locked,
        current: scenario ? sliceFrom <= spot && sliceTo > spot : current,
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

    if (left < geometrySpot && right > geometrySpot) {
      push(left, geometrySpot, liquidity, "token1", current)
      push(geometrySpot, right, liquidity, "token0", current)
    } else {
      push(
        left,
        right,
        liquidity,
        right <= geometrySpot ? "token1" : "token0",
        current,
      )
    }
  }

  // The explainer presents the vault's position as a schematic profile: its
  // managed bars share one height and the background bars stay low. Recentering
  // moves that same profile to the new band. Every slice stays mounted so the
  // height transition remains smooth. The main chart continues to show the
  // pool's unmodified on-chain liquidity distribution.
  const displayBars =
    scenario && out.length
      ? (() => {
          const midpoint = (bar: Bar) => (bar.from + bar.to) / 2
          const rawFloor = out.reduce(
            (value, bar) => Math.min(value, bar.liquidity),
            Number.POSITIVE_INFINITY,
          )
          const managedValues = out
            .filter((bar) => {
              const center = midpoint(bar)
              return center >= base.lower && center <= base.upper
            })
            .map((bar) => bar.liquidity)
          const reference = managedValues.reduce(
            (value, liquidity) => Math.max(value, liquidity),
            rawFloor,
          )
          const managed = reference * 0.8
          const background = reference * 0.5
          const active = scenario === "recentered" ? recentered : base

          return out.map((bar) => {
            const center = midpoint(bar)
            const isManaged = center >= active.lower && center <= active.upper

            return {
              ...bar,
              liquidity: isManaged ? managed : background,
            }
          })
        })()
      : out

  return {
    bars: displayBars,
    spotTick: spot,
    // Preserve the real distribution's ceiling in the explainer so flattening
    // its outlier does not rescale the uniform managed block to full height.
    max: out.reduce((value, bar) => Math.max(value, bar.liquidity), 0),
    lo: from,
    hi: to,
    bands,
  }
}
