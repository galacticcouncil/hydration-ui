import { VaultState } from "@/api/gamma/vaults"
import { V3PoolBase } from "@/api/pools"

export const priceAtTick = (
  tick: number,
  decimals0: number,
  decimals1: number,
) => Math.pow(1.0001, tick) * Math.pow(10, decimals0 - decimals1)

const sqrtRatioAtTick = (tick: number) => Math.pow(1.0001, tick / 2)

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

export type Bar = {
  key: string
  from: number
  to: number
  liquidity: number
  side: "token0" | "token1"
  rangeFrom: number
  rangeTo: number
  locked: number
  current: boolean
}

type ManagedRangeTheme = {
  controls: {
    outline: { active: string }
  }
}

export const MANAGED_RANGE = {
  getColor: ({ controls }: ManagedRangeTheme) => controls.outline.active,
  fillOpacity: 0.35,
  borderOpacity: 0.85,
} as const

export const managedRangeMixedColor = (color: string, opacity: number) =>
  `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`

export const managedRangeChartStroke = (
  color: string,
  borderOpacity: number,
) =>
  borderOpacity <= 0
    ? { stroke: "none", strokeWidth: 0 }
    : {
        stroke: managedRangeMixedColor(color, borderOpacity),
        strokeWidth: 1,
      }

type Band = {
  id: "active" | "previous" | "base" | "limit"
  lower: number
  upper: number
  height: number
}

export type RangeScenario = "inRange" | "outOfRange" | "recentered"

export const BARS_ID = "liquidity-bars"
const SLICE_TARGET = 30
const DEFAULT_DOMAIN_PADDING_RATIO = 1
const ZOOMED_DOMAIN_PADDING_RATIO = 0.1
const MEANINGFUL_LIQUIDITY_PERCENT = 5n
/** keeps a tiny vault position visible as a range marker */
const MIN_BAND_HEIGHT = 0.02

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

type VaultBands = Pick<
  VaultState,
  "baseLower" | "baseUpper" | "limitLower" | "limitUpper" | "base" | "limit"
>

export const hasBase = (state: VaultBands) =>
  state.baseUpper > state.baseLower && state.base.liquidity > 0n

export const hasLimit = (state: VaultBands) =>
  state.limitUpper > state.limitLower && state.limit.liquidity > 0n

export const getManagedBand = (
  tick: number,
  state: VaultBands,
): "base" | "limit" | null => {
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
  pool: Pick<V3PoolBase, "tick" | "liquidity" | "ticks">
  state: VaultBands | null
  decimals0: number
  decimals1: number
  scenario?: RangeScenario
}) => {
  const ticks = [...(pool.ticks ?? [])].sort((a, b) => a.index - b.index)
  const marketSpot = pool.tick

  let running = pool.liquidity
  for (const tick of ticks) {
    if (tick.index <= marketSpot) running -= tick.liquidityNet
  }

  const liquidityIntervals: Array<{
    lower: number
    upper: number
    liquidity: bigint
  }> = []

  for (let i = 0; i < ticks.length - 1; i++) {
    const tick = ticks[i]
    const next = ticks[i + 1]
    if (!tick || !next) continue

    running += tick.liquidityNet
    if (running > 0n) {
      liquidityIntervals.push({
        lower: tick.index,
        upper: next.index,
        liquidity: running,
      })
    }
  }

  const bandWidth = state ? state.baseUpper - state.baseLower : 0
  const edges = state
    ? [
        marketSpot,
        ...(bandWidth > 0 ? [state.baseLower, state.baseUpper] : []),
        ...(hasLimit(state) ? [state.limitLower, state.limitUpper] : []),
      ]
    : []
  const edgeSpan =
    edges.length > 1 ? Math.max(...edges) - Math.min(...edges) : 0
  const edgeLower = edges.length ? Math.min(...edges) : marketSpot
  const edgeUpper = edges.length ? Math.max(...edges) : marketSpot
  const maxLiquidity = liquidityIntervals.reduce(
    (value, interval) =>
      interval.liquidity > value ? interval.liquidity : value,
    0n,
  )
  const meaningfulLiquidity =
    (maxLiquidity * MEANINGFUL_LIQUIDITY_PERCENT) / 100n
  const wideLower = edgeLower - edgeSpan
  const wideUpper = edgeUpper + edgeSpan
  const hasMeaningfulOuterLiquidity = liquidityIntervals.some(
    (interval) =>
      interval.liquidity >= meaningfulLiquidity &&
      interval.upper > wideLower &&
      interval.lower < wideUpper &&
      (interval.lower < edgeLower || interval.upper > edgeUpper),
  )
  const paddingRatio =
    scenario || hasMeaningfulOuterLiquidity
      ? DEFAULT_DOMAIN_PADDING_RATIO
      : ZOOMED_DOMAIN_PADDING_RATIO
  const pad = edgeSpan > 0 ? edgeSpan * paddingRatio : 3000
  const from = edges.length ? edgeLower - pad : marketSpot - 3000
  const to = edges.length ? edgeUpper + pad : marketSpot + 3000
  const span = to - from

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

  const out: Bar[] = []
  const sliceWidth = (to - from) / SLICE_TARGET
  // explainer: bar sizes follow market tick, not the staged price
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

  for (const interval of liquidityIntervals) {
    const left = Math.max(interval.lower, from)
    const right = Math.min(interval.upper, to)
    if (right <= left) continue

    const liquidity = Number(interval.liquidity)

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

  const max = out.reduce((value, bar) => Math.max(value, bar.liquidity), 0)

  // band height = vault liquidity as a share of the chart's liquidity scale,
  // so a position holding half the liquidity in its range draws half as tall
  const bandHeight = (liquidity: bigint) =>
    max > 0 ? Math.max(MIN_BAND_HEIGHT, Number(liquidity) / max) : 1

  const bands: ReadonlyArray<Band> = scenario
    ? [
        ...(scenario === "recentered"
          ? [
              {
                id: "previous" as const,
                ...base,
                height: 1.05,
              },
            ]
          : []),
        {
          id: "active",
          ...(scenario === "recentered" ? recentered : base),
          height: 1.05,
        },
      ]
    : [
        ...(state && hasBase(state)
          ? [
              {
                id: "base" as const,
                ...base,
                height: bandHeight(state.base.liquidity),
              },
            ]
          : []),
        ...(state && hasLimit(state)
          ? [
              {
                id: "limit" as const,
                lower: state.limitLower,
                upper: state.limitUpper,
                height: bandHeight(state.limit.liquidity),
              },
            ]
          : []),
      ]

  return {
    bars: displayBars,
    spotTick: spot,
    max,
    lo: from,
    hi: to,
    bands,
  }
}

export const SCENARIO_POOL = {
  spot: 182706,
  lower: 182040,
  upper: 183300,
  spacing: 60,
  liquidity: 11046262071882846000n,
  decimals0: 10,
  decimals1: 18,
}

export const getScenarioDistribution = (
  scenario: RangeScenario,
  overrides: Partial<typeof SCENARIO_POOL> = {},
) => {
  const { spot, lower, upper, spacing, liquidity, decimals0, decimals1 } = {
    ...SCENARIO_POOL,
    ...overrides,
  }
  const width = upper - lower
  // initialized ticks: the band edges, the pair straddling spot, and the padding
  const indexes = [
    lower - width,
    lower,
    Math.floor(spot / spacing) * spacing,
    Math.ceil(spot / spacing) * spacing,
    upper,
    upper + width,
  ]

  return {
    ...getLiquidityDistribution({
      pool: {
        tick: spot,
        liquidity,
        ticks: [...new Set(indexes)].map((index) => ({
          index,
          liquidityNet: 0n,
          liquidityGross: 0n,
        })),
      },
      state: {
        baseLower: lower,
        baseUpper: upper,
        limitLower: 0,
        limitUpper: 0,
        base: { liquidity, amount0: 0n, amount1: 0n },
        limit: { liquidity: 0n, amount0: 0n, amount1: 0n },
      },
      decimals0,
      decimals1,
      scenario,
    }),
    decimals0,
    decimals1,
  }
}
