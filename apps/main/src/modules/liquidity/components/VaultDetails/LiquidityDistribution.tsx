import { Chart, Chip, Flex, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { defineChart, dot, rect, ruleX, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssetColor } from "@/hooks/useAssetColor"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

/** token1 per token0, decimal-adjusted, from a tick */
const priceAtTick = (tick: number, decimals0: number, decimals1: number) =>
  Math.pow(1.0001, tick) * Math.pow(10, decimals0 - decimals1)

const priceFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 4,
})

const formatNumber = (value: number) =>
  value < 0.001 ? value.toExponential(2) : priceFormatter.format(value)

const formatPrice = (tick: number, decimals0: number, decimals1: number) =>
  formatNumber(priceAtTick(tick, decimals0, decimals1))

const amountFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
})

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
type Bar = {
  from: number
  to: number
  liquidity: number
  /** below the spot tick a range holds token1, above it token0 */
  side: "token0" | "token1"
  /** bounds of the range this slice was cut from */
  rangeFrom: number
  rangeTo: number
  /** token amount the whole range holds, in the `side` token */
  locked: number
  /** the range the spot tick falls in */
  current: boolean
}

const BARS_ID = "liquidity-bars"
/** false draws one bar per range, true cuts each range into slices for looks */
const SPLIT_RANGES = true
/** slices across the whole window; each range gets its proportional share */
const SLICE_TARGET = 30
const TICK_FONT_SIZE = 12
const TICK_PADDING = 8
/** puts a mark's label on the same baseline the axis gives its own tick labels */
const TICK_BASELINE = TICK_PADDING + TICK_FONT_SIZE * 0.8
const BAR_RADIUS = 4
const BAR_GAP = 4

const FADED_OPACITY = 0.4
const FOCUS_TRANSITION = {
  type: "tween" as const,
  duration: 350,
  easing: "ease-out" as const,
}

/** Bands and labels emit focus points too, so only bars may open a tooltip */
const isBarPoint = <TPoint extends { markId: string; datum: unknown }>(
  point: TPoint,
): point is TPoint & { datum: Bar } => point.markId === BARS_ID

/** the hovered slice and this one were cut from the same range */
const isSameRange = (focused: { markId: string; datum: unknown }, bar: Bar) =>
  !isBarPoint(focused) ||
  (focused.datum.rangeFrom === bar.rangeFrom &&
    focused.datum.rangeTo === bar.rangeTo)

/** Which step of the managed-range lifecycle the chart illustrates */
export type RangeScenario = "inRange" | "outOfRange" | "recentered"

// Initialised ticks accumulate into active-liquidity ranges — liquidity is
// constant between two initialised ticks — which are then sliced for looks only.
export const LiquidityDistribution = ({
  vault,
  scenario,
  height = 420,
}: {
  vault: VaultTable
  /** set to walk through the lifecycle: the depth is real, the price is staged */
  scenario?: RangeScenario
  height?: number
}) => {
  const { t } = useTranslation("liquidity")
  const { themeProps } = useTheme()
  const getAssetColor = useAssetColor()
  const [token0, token1] = vault.tokens
  const { decimals: decimals0 } = token0
  const { decimals: decimals1 } = token1

  const colors = useMemo(
    () => ({
      // the illustration is not live data, so it stays off the live palette
      token0: scenario
        ? themeProps.controls.solid.accent
        : getAssetColor(token0.id),
      token1: scenario
        ? themeProps.controls.solid.base
        : getAssetColor(token1.id),
      spot: themeProps.buttons.primary.high.rest,
      range: themeProps.text.medium,
      rangeFill: themeProps.controls.dim.active,
      rangeEdge: themeProps.controls.outline.active,
      surface: themeProps.surfaces.themeBasePalette.surfaceHigh,
    }),
    [getAssetColor, scenario, themeProps, token0.id, token1.id],
  )

  const { bars, spotTick, max, lo, hi, bands } = useMemo(() => {
    const ticks = [...(vault.pool.ticks ?? [])].sort(
      (a, b) => a.index - b.index,
    )
    const marketSpot = vault.pool.tick
    const state = vault.vault
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
    const bands: ReadonlyArray<{
      lower: number
      upper: number
      opacity: number
      /** share of the plot height, so overlapping bands stay tellable apart */
      height: number
    }> =
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

    let running = vault.pool.liquidity
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
      const count = SPLIT_RANGES
        ? Math.max(1, Math.round((right - left) / sliceWidth))
        : 1
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
        push(
          left,
          right,
          liquidity,
          right <= spot ? "token1" : "token0",
          current,
        )
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
  }, [vault.pool, vault.vault, decimals0, decimals1, scenario])

  const state = vault.vault
  // full-height overlays span the liquidity domain, so they need its ceiling
  const top = max || 1
  // headroom above the deepest bar: anything drawn at `top` would sit exactly on
  // the plot edge and be clipped away
  const ceiling = top * 1.12

  // ponytail: temporary debug, remove before merge
  console.log("vault ranges", {
    address: state?.address,
    spot: vault.pool.tick,
    tickSpacing: vault.pool.tickSpacing,
    baseLower: state?.baseLower,
    baseUpper: state?.baseUpper,
    limitLower: state?.limitLower,
    limitUpper: state?.limitUpper,
    window: [lo, hi],
    poolLiquidity: vault.pool.liquidity,
    ticks: vault.pool.ticks,
    bars,
  })

  const definition = useMemo(() => {
    const band = (
      lower: number,
      upper: number,
      label: string,
      fillOpacity: number,
      strokeOpacity: number,
      height: number,
    ) => [
      decorative(
        rect([{ lower, upper }], {
          x1: "lower",
          x2: "upper",
          y1: () => 0,
          y2: () => height,
          fill: colors.rangeFill,
          fillOpacity,
          // rect has no strokeOpacity channel, so it goes into the colour
          stroke: `color-mix(in srgb, ${colors.rangeEdge} ${
            strokeOpacity * 100
          }%, transparent)`,
          strokeWidth: 1,
          radius: 5,
          inset: 0,
        }),
      ),
      decorative(
        text([{ tick: (lower + upper) / 2, label }], {
          x: "tick",
          y: () => ceiling,
          text: "label",
          fill: colors.range,
          fontSize: 11,
          dy: 8,
        }),
      ),
    ]

    return defineChart({
      focusRing: false,
      marks: [
        rect(bars, {
          id: BARS_ID,
          x1: "from",
          x2: "to",
          y1: () => 0,
          y2: "liquidity",
          color: "side",
          key: (bar) => bar.from,
          inset: 0,
          radius: BAR_RADIUS,
          stroke: colors.surface,
          strokeWidth: BAR_GAP,
          fillOpacity: 1,
          // a range is drawn as several slices, so hovering one lights them all
          states: [
            {
              when: ({ datum, focus }) => !isSameRange(focus.primary, datum),
              style: { fillOpacity: FADED_OPACITY },
              transition: FOCUS_TRANSITION,
            },
            {
              when: ({ datum, focus }) => isSameRange(focus.primary, datum),
              style: { fillOpacity: 1 },
              transition: FOCUS_TRANSITION,
            },
          ],
        }),
        ...bands.flatMap(({ lower, upper, opacity, height }) =>
          band(lower, upper, "", opacity, opacity * 0.58, top * height),
        ),
        ruleX([spotTick], {
          stroke: colors.spot,
          strokeOpacity: 1,
          strokeWidth: 2,
        }),
        dot([spotTick], {
          x: (tick) => tick,
          y: () => ceiling,
          r: 4,
          fill: colors.spot,
        }),
        // the axis cannot colour one tick on its own, so the spot price is
        // drawn as a mark into the bottom margin instead
        text([spotTick], {
          x: (tick) => tick,
          y: () => 0,
          text: (tick) => formatPrice(tick, token0.decimals, token1.decimals),
          fill: colors.spot,
          fontSize: TICK_FONT_SIZE,
          dy: TICK_BASELINE,
        }),
      ],
      x: {
        scale: scaleLinear().domain([lo, hi]),
        axis: {
          line: false,
          ticks: {
            values: [lo, hi],
            size: 0,
            padding: TICK_PADDING,
            format: (tick) =>
              formatPrice(tick, token0.decimals, token1.decimals),
          },
          tickLabels: {
            fontSize: TICK_FONT_SIZE,
            // the outer ticks hug the plot edges instead of straddling them
            anchor: ({ value }) => (value === lo ? "start" : "end"),
          },
        },
      },
      y: {
        scale: scaleLinear().domain([0, ceiling]),
        grid: true,
        axis: false,
      },
      color: {
        domain: ["token1", "token0"],
        range: [colors.token1, colors.token0],
      },
      tooltip: {
        use: tooltip,
        sticky: false,
        placement: "top",
      },
    })
  }, [
    bands,
    bars,
    colors,
    hi,
    lo,
    spotTick,
    token0.decimals,
    token1.decimals,
    ceiling,
    top,
  ])

  if (!bars.length)
    return (
      <Flex direction="column" justify="center" sx={{ minHeight: height }}>
        <Text fs="p5" color={getToken("text.low")}>
          {t("vaults.chart.empty")}
        </Text>
      </Flex>
    )

  const price = priceAtTick(spotTick, token0.decimals, token1.decimals)

  return (
    <Flex direction="column" sx={{ minHeight: height }}>
      {!scenario && (
        <Flex
          justify="space-between"
          align={["flex-start", "center"]}
          direction={["column", "row"]}
          gap="m"
          sx={{ mb: "m" }}
        >
          <Flex direction="column" gap="xs">
            <Text fs="p6" color={getToken("text.low")}>
              {t("vaults.chart.currentPrice")}
            </Text>
            <Text fs="p3" font="primary">
              1 {token0.symbol} = {priceFormatter.format(price)} {token1.symbol}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              1 {token1.symbol} = {priceFormatter.format(1 / price)}{" "}
              {token0.symbol}
            </Text>
          </Flex>

          <Flex align="center" gap="s" sx={{ flexWrap: "wrap" }}>
            <Text fs="p6" color={getToken("text.low")}>
              {t("vaults.chart.activeTick", { tick: spotTick })}
            </Text>
          </Flex>
        </Flex>
      )}

      <Chart
        // the grid has no dasharray option, so it is styled through its class
        css={{ ".ts-chart__grid": { strokeDasharray: "2 4" } }}
        definition={definition}
        ariaLabel={t(
          scenario ? "vaults.explainer.chartLabel" : "vaults.chart.liquidity",
        )}
        height={height}
        renderTooltipBody={({ points }) => {
          // the staged price makes per-tick amounts meaningless
          if (scenario) return null

          const [first] = points.filter(isBarPoint)

          if (!first) return null

          return <TickStats bar={first.datum} vault={vault} />
        }}
      />

      <Flex gap="l" sx={{ mt: "s", flexWrap: "wrap" }}>
        <Legend
          color={colors.token1}
          label={
            scenario
              ? t("vaults.explainer.legend.tokenB")
              : t("vaults.chart.legend.token1", { symbol: token1.symbol })
          }
        />
        <Legend
          color={colors.token0}
          label={
            scenario
              ? t("vaults.explainer.legend.tokenA")
              : t("vaults.chart.legend.token0", { symbol: token0.symbol })
          }
        />
        <Legend color={colors.spot} label={t("vaults.chart.legend.spot")} />
        <Legend
          color={colors.rangeFill}
          label={t("vaults.chart.legend.ranges")}
        />
      </Flex>
    </Flex>
  )
}

const Legend = ({
  color,
  label,
  background,
}: {
  color: string
  label: string
  background?: string
}) => (
  <Flex align="center" gap="s">
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: 3,
        background: background ?? color,
        border: background ? `1px solid ${color}` : undefined,
        display: "inline-block",
      }}
    />
    <Text fs="p6" color={getToken("text.low")}>
      {label}
    </Text>
  </Flex>
)

/** Tick stats, following the rows Uniswap's own density chart shows */
const TickStats = ({ bar, vault }: { bar: Bar; vault: VaultTable }) => {
  const { t } = useTranslation("liquidity")
  const [token0, token1] = vault.tokens
  const { decimals: decimals0 } = token0
  const { decimals: decimals1 } = token1

  const low = priceAtTick(bar.rangeFrom, decimals0, decimals1)
  const high = priceAtTick(bar.rangeTo, decimals0, decimals1)
  const held = bar.side === "token0" ? token0 : token1

  return (
    <Flex direction="column" gap="base" sx={{ p: "m", minWidth: 240 }}>
      <Flex justify="space-between" align="center" gap="m">
        <Text
          fs="p5"
          color={getToken("text.high")}
          fontVariantNumeric="tabular-nums"
          whiteSpace="nowrap"
        >
          {formatNumber(low)} – {formatNumber(high)}
        </Text>
        {bar.current && (
          <Chip size="small" variant="lime">
            {t("vaults.chart.tooltip.current")}
          </Chip>
        )}
      </Flex>

      <TickStatsRow
        label={t("vaults.chart.tooltip.locked")}
        icon={<AssetLogo id={held.id} size="extra-small" />}
        value={`${amountFormatter.format(bar.locked)} ${held.symbol}`}
      />
    </Flex>
  )
}

const TickStatsRow = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) => (
  <Flex justify="space-between" align="center" gap="xl">
    <Text fs="p6" color={getToken("text.medium")} whiteSpace="nowrap">
      {label}
    </Text>
    <Flex align="center" gap="xs">
      {icon}
      <Text
        fs="p6"
        lh={1}
        color={getToken("text.high")}
        fontVariantNumeric="tabular-nums"
        whiteSpace="nowrap"
      >
        {value}
      </Text>
    </Flex>
  </Flex>
)
