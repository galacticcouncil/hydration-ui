import { Chart, Chip, Flex, Text } from "@galacticcouncil/ui/components"
import { useResponsiveValue, useTheme } from "@galacticcouncil/ui/theme"
import type { ResponsiveStyleValue } from "@galacticcouncil/ui/types"
import { getToken } from "@galacticcouncil/ui/utils"
import { defineChart, dot, rect, ruleX, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useAssetColor } from "@/hooks/useAssetColor"
import {
  Bar,
  BARS_ID,
  getLiquidityDistribution,
  isBarPoint,
  isSameRange,
  priceAtTick,
  RangeScenario,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution.utils"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

export type { RangeScenario }

const TICK_PADDING = 8
const BAR_RADIUS = 4
const BAR_GAP = 4

const FADED_OPACITY = 0.4
const FOCUS_TRANSITION = {
  type: "tween" as const,
  duration: 350,
  easing: "ease-out" as const,
}
const SCENARIO_TRANSITION = {
  transition: {
    type: "tween" as const,
    duration: 650,
    easing: "ease-in-out" as const,
  },
}

const DEFAULT_HEIGHT: ResponsiveStyleValue<number> = [280, 420]

export const LiquidityDistribution = ({
  vault,
  scenario,
  height,
}: {
  vault: VaultTable
  /** set to stage the price and managed band over the pool's real depth */
  scenario?: RangeScenario
  height?: ResponsiveStyleValue<number>
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { themeProps } = useTheme()
  const resolvedHeight = useResponsiveValue(height ?? DEFAULT_HEIGHT)
  const getAssetColor = useAssetColor()
  const [token0, token1] = vault.tokens
  const { decimals: decimals0 } = token0
  const { decimals: decimals1 } = token1

  const tickFontSize = themeProps.paragraphSize.p5
  /** puts a mark's label on the same baseline the axis gives its own tick labels */
  const tickBaseline = TICK_PADDING + tickFontSize * 0.8

  const colors = useMemo(
    () => ({
      token0: scenario
        ? themeProps.controls.solid.accent
        : getAssetColor(token0.id),
      token1: scenario
        ? themeProps.controls.solid.base
        : getAssetColor(token1.id),
      spot: themeProps.buttons.primary.high.rest,
      rangeFill: themeProps.controls.dim.active,
      rangeEdge: themeProps.controls.outline.active,
      surface: themeProps.surfaces.themeBasePalette.surfaceHigh,
    }),
    [getAssetColor, scenario, themeProps, token0.id, token1.id],
  )

  const { bars, spotTick, max, lo, hi, bands } = useMemo(
    () =>
      getLiquidityDistribution({
        pool: vault.pool,
        state: vault.vault,
        decimals0,
        decimals1,
        scenario,
      }),
    [vault.pool, vault.vault, decimals0, decimals1, scenario],
  )

  const top = max || 1
  const ceiling = top * 1.12

  const definition = useMemo(() => {
    const bandMarks = scenario
      ? []
      : bands.map(({ id, lower, upper, opacity, height }) =>
          decorative(
            rect([{ lower, upper }], {
              id: `managed-band-${id}`,
              x1: "lower",
              x2: "upper",
              y1: () => 0,
              y2: () => top * height,
              fill: colors.rangeFill,
              fillOpacity: opacity,
              // rect has no strokeOpacity channel, so it goes into the colour
              stroke: `color-mix(in srgb, ${colors.rangeEdge} ${
                opacity * 58
              }%, transparent)`,
              strokeWidth: 1,
              radius: 5,
              inset: 0,
            }),
          ),
        )

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
          key: (bar) => bar.key,
          inset: 0,
          radius: BAR_RADIUS,
          stroke: colors.surface,
          strokeWidth: BAR_GAP,
          fillOpacity: 1,
          motion: scenario ? SCENARIO_TRANSITION : undefined,
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
        ...bandMarks,
        ...(scenario
          ? []
          : [
              ruleX([spotTick], {
                id: "current-price-rule",
                key: () => "current-price",
                stroke: colors.spot,
                strokeOpacity: 1,
                strokeWidth: 2,
              }),
              dot([spotTick], {
                id: "current-price-dot",
                key: () => "current-price",
                x: (tick) => tick,
                y: () => ceiling,
                r: 4,
                fill: colors.spot,
              }),
              // the axis cannot colour one tick on its own, so the spot price
              // is drawn as a mark into the bottom margin instead
              text([spotTick], {
                id: "current-price-label",
                key: () => "current-price",
                x: (tick) => tick,
                y: () => 0,
                text: (tick) =>
                  t("common:number", {
                    value: priceAtTick(tick, token0.decimals, token1.decimals),
                  }),
                fill: colors.spot,
                fontSize: tickFontSize,
                dy: tickBaseline,
              }),
            ]),
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
              t("common:number", {
                value: priceAtTick(tick, token0.decimals, token1.decimals),
              }),
          },
          tickLabels: {
            fontSize: tickFontSize,
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
    t,
    tickBaseline,
    tickFontSize,
    token0.decimals,
    token1.decimals,
    ceiling,
    top,
    scenario,
  ])

  if (!bars.length)
    return (
      <Flex
        direction="column"
        justify="center"
        sx={{ minHeight: resolvedHeight }}
      >
        <Text fs="p5" color={getToken("text.low")}>
          {t("vaults.chart.empty")}
        </Text>
      </Flex>
    )

  const price = priceAtTick(spotTick, token0.decimals, token1.decimals)

  return (
    <Flex direction="column" sx={{ minHeight: resolvedHeight }}>
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
            <Text fs="p2" fw={500} font="primary">
              {t("vaults.price.pair", {
                value: price,
                symbolA: token0.symbol,
                symbolB: token1.symbol,
              })}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              {t("vaults.price.pair", {
                value: 1 / price,
                symbolA: token1.symbol,
                symbolB: token0.symbol,
              })}
            </Text>
          </Flex>
        </Flex>
      )}

      <Flex sx={{ position: "relative", minWidth: 0 }}>
        <Chart
          // the grid has no dasharray option, so it is styled through its class
          css={{ ".ts-chart__grid": { strokeDasharray: "2 4" } }}
          definition={definition}
          ariaLabel={t(
            scenario ? "vaults.explainer.chartLabel" : "vaults.chart.liquidity",
          )}
          height={resolvedHeight}
          renderTooltipBody={({ points }) => {
            // the staged price makes per-tick amounts meaningless
            if (scenario) return null

            const [first] = points.filter(isBarPoint)

            if (!first) return null

            return <TickStats bar={first.datum} vault={vault} />
          }}
        />

        {scenario && (
          <>
            {bands.map((managedBand) => (
              <Flex
                key={managedBand.id}
                aria-hidden
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  top: 8,
                  bottom: 25,
                  left: `${((managedBand.lower - lo) / (hi - lo)) * 100}%`,
                  width: `${
                    ((managedBand.upper - managedBand.lower) / (hi - lo)) * 100
                  }%`,
                  border: `1px solid color-mix(in srgb, ${colors.rangeEdge} 28%, transparent)`,
                  borderRadius: 5,
                  bg: colors.rangeFill,
                  opacity: managedBand.opacity,
                  pointerEvents: "none",
                  transitionProperty: "left, width, opacity",
                  transitionDuration: "650ms",
                  transitionTimingFunction: "ease-in-out",
                }}
              />
            ))}

            <Flex
              aria-hidden
              sx={{
                position: "absolute",
                zIndex: 2,
                top: 8,
                bottom: 25,
                left: `${Math.min(
                  100,
                  Math.max(0, ((spotTick - lo) / (hi - lo)) * 100),
                )}%`,
                width: 2,
                bg: colors.spot,
                transform: "translateX(-1px)",
                pointerEvents: "none",
                transitionProperty: "left",
                transitionDuration: "650ms",
                transitionTimingFunction: "ease-in-out",
              }}
            >
              <Flex
                sx={{
                  position: "absolute",
                  top: -4,
                  left: "50%",
                  width: 8,
                  height: 8,
                  borderRadius: "full",
                  bg: colors.spot,
                  transform: "translateX(-50%)",
                }}
              />
              <Text
                fs="p6"
                sx={{
                  position: "absolute",
                  bottom: -22,
                  left: "50%",
                  color: colors.spot,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                {t("common:number", {
                  value: priceAtTick(
                    spotTick,
                    token0.decimals,
                    token1.decimals,
                  ),
                })}
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      <Flex gap="0.3rem 1.5rem" mt="s" wrap>
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

const Legend = ({ color, label }: { color: string; label: string }) => (
  <Flex align="center" gap="s">
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: 3,
        background: color,
        display: "inline-block",
      }}
    />
    <Text fs="p6" color={getToken("text.low")}>
      {label}
    </Text>
  </Flex>
)

const TickStats = ({ bar, vault }: { bar: Bar; vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
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
          {t("common:number.range", { from: low, to: high })}
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
        value={t("vaults.chart.tooltip.lockedAmount", {
          value: bar.locked,
          symbol: held.symbol,
        })}
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
