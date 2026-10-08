import {
  Box,
  Chart,
  Chip,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useResponsiveValue, useTheme } from "@galacticcouncil/ui/theme"
import type { ResponsiveStyleValue } from "@galacticcouncil/ui/types"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { defineChart, dot, rect, ruleX, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { portal } from "@tanstack/charts/tooltip/portal"
import Big from "big.js"
import { Fragment, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { ChartState } from "@/components/ChartState"
import { useAssetColor } from "@/hooks/useAssetColor"
import {
  SLiquidityLegend,
  SManagedBand,
  SRangeLegendToggle,
  SSpotLine,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution.styled"
import {
  BACKGROUND_TIER_TINT,
  BAND_GAP,
  BAND_RADIUS,
  BAR_GAP,
  BAR_RADIUS,
  CHART_GUIDE_INSET,
  DEFAULT_DESKTOP_HEIGHT,
  DEFAULT_HEIGHT,
  FADED_OPACITY,
  FOCUS_TRANSITION,
  managedRangeChartStroke,
  managedRangeMixedColor,
  ManagedRangeStyle,
  managedRangeStyle,
  MIN_BAR_HEIGHT,
  plotCssPos,
  plotCssWidth,
  SCENARIO_TRANSITION,
  SHORT_BAR_RATIO,
  TICK_PADDING,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution.theme"
import {
  BandId,
  bandSegments,
  Bar,
  BARS_ID,
  getLiquidityDistribution,
  getManagedBands,
  getScenarioDistribution,
  isBarPoint,
  isSameRange,
  priceAtTick,
  RangeScenario,
} from "@/modules/liquidity/components/VaultDetails/LiquidityDistribution.utils"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type { RangeScenario }

const Legend = ({ color, label }: { color: string; label: string }) => (
  <Flex align="center" gap="s">
    <Box
      as="span"
      size="xs"
      borderRadius="base"
      bg={color}
      display="inline-block"
    />
    <Text fs="p6" color={getToken("text.low")}>
      {label}
    </Text>
  </Flex>
)

const RangeSwatch = ({ range }: { range: ManagedRangeStyle }) => (
  <Box
    as="span"
    size="xs"
    borderRadius="base"
    display="inline-block"
    sx={{
      background: managedRangeMixedColor(range.color, range.fillOpacity),
      border: `1px solid ${managedRangeMixedColor(range.color, range.borderOpacity)}`,
    }}
  />
)

const RangeLegend = ({
  range,
  label,
  visible,
  onToggle,
}: {
  range: ManagedRangeStyle
  label: string
  visible: boolean
  onToggle: () => void
}) => (
  <SRangeLegendToggle
    as="button"
    align="center"
    gap="s"
    aria-pressed={visible}
    aria-label={label}
    onClick={onToggle}
    sx={{ opacity: visible ? 1 : FADED_OPACITY }}
  >
    <RangeSwatch range={range} />
    <Text fs="p6" color={getToken("text.low")}>
      {label}
    </Text>
  </SRangeLegendToggle>
)

export const LiquidityDistribution = ({
  vault,
  scenario,
  height,
}: {
  vault: VaultTable
  scenario?: RangeScenario
  height?: ResponsiveStyleValue<number>
}) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [managedRangesVisible, setManagedRangesVisible] = useState(true)
  const { themeProps } = useTheme()
  const resolvedHeight = useResponsiveValue(height ?? DEFAULT_HEIGHT)
  const getAssetColor = useAssetColor()
  const [token0, token1] = vault.tokens
  const { decimals: decimals0 } = token0
  const { decimals: decimals1 } = token1
  const flipped = !scenario && vault.pair[0].id !== token0.id

  const tickFontSize = themeProps.paragraphSize.p5
  const tickBaseline = TICK_PADDING + tickFontSize * 0.8

  const rangeStyle = useCallback(
    (id?: BandId) => managedRangeStyle(themeProps, id),
    [themeProps],
  )

  const colors = useMemo(
    () => ({
      token0: scenario
        ? themeProps.controls.solid.accent
        : getAssetColor(token0.id),
      token1: scenario
        ? themeProps.controls.solid.base
        : getAssetColor(token1.id),
      spot: themeProps.buttons.primary.high.rest,
      surface: themeProps.surfaces.themeBasePalette.surfaceHigh,
      background: managedRangeMixedColor(
        themeProps.text.low,
        BACKGROUND_TIER_TINT,
      ),
    }),
    [getAssetColor, scenario, themeProps, token0.id, token1.id],
  )

  const { bars, spotTick, max, lo, hi, bands, chartDecimals0, chartDecimals1 } =
    useMemo(() => {
      if (scenario) {
        const staged = getScenarioDistribution(scenario)
        return {
          ...staged,
          chartDecimals0: staged.decimals0,
          chartDecimals1: staged.decimals1,
        }
      }

      const result = getLiquidityDistribution({
        pool: vault.pool,
        state: vault.vault,
        decimals0,
        decimals1,
      })

      return {
        ...result,
        chartDecimals0: decimals0,
        chartDecimals1: decimals1,
      }
    }, [vault.pool, vault.vault, decimals0, decimals1, scenario])

  const top = max || 1
  const ceiling = top * 1.12
  const chartHeight = resolvedHeight ?? DEFAULT_DESKTOP_HEIGHT
  const minVisibleLiquidity = ceiling * (MIN_BAR_HEIGHT / chartHeight)
  const bandGap = ceiling * (BAND_GAP / chartHeight)

  const definition = useMemo(() => {
    let tooltipSide: "left" | "right" | "top" = "right"

    const displayPrice = (tick: number) => {
      const price = priceAtTick(tick, chartDecimals0, chartDecimals1)
      return flipped ? 1 / price : price
    }

    const bandMarks =
      managedRangesVisible && !scenario
        ? bands.flatMap((band) =>
            bandSegments(band, bars, top, minVisibleLiquidity).map(
              (segment, index) =>
                decorative(
                  rect([segment], {
                    id: `managed-band-${band.id}-${index}`,
                    x1: "lower",
                    x2: "upper",
                    // the band caps the bars it covers instead of stacking
                    // above them; a stacked band is trimmed at the bottom so
                    // it doesn't touch the band underneath; with nothing
                    // underneath it sits flush on the axis
                    y1: () => {
                      const bottom =
                        segment.barTop -
                        Math.max(top * band.height, minVisibleLiquidity)
                      return bottom > bandGap ? bottom + bandGap : 0
                    },
                    y2: () => segment.barTop,
                    fill: rangeStyle(band.id).color,
                    fillOpacity: rangeStyle(band.id).fillOpacity,
                    ...managedRangeChartStroke(
                      rangeStyle(band.id).color,
                      rangeStyle(band.id).borderOpacity,
                    ),
                    radius: BAND_RADIUS,
                    inset: 0,
                  }),
                ),
            ),
          )
        : []

    return defineChart({
      focusRing: false,
      margin: scenario ? CHART_GUIDE_INSET : undefined,
      marks: [
        rect(bars, {
          id: BARS_ID,
          x1: "from",
          x2: "to",
          y1: () => 0,
          y2: (bar) => Math.max(bar.liquidity, minVisibleLiquidity),
          color: "colorGroup",
          key: (bar) => bar.key,
          inset: 0,
          radius: BAR_RADIUS,
          stroke: colors.surface,
          strokeWidth: BAR_GAP,
          fillOpacity: 1,
          motion: scenario ? SCENARIO_TRANSITION : undefined,
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
              text([spotTick], {
                id: "current-price-label",
                key: () => "current-price",
                x: (tick) => tick,
                y: () => 0,
                text: (tick) =>
                  t("common:number", { value: displayPrice(tick) }),
                fill: colors.spot,
                fontSize: tickFontSize,
                dy: tickBaseline,
              }),
            ]),
      ],
      x: {
        // flipped prices fall as ticks rise, so run the axis backwards
        scale: scaleLinear().domain(flipped ? [hi, lo] : [lo, hi]),
        axis: scenario
          ? false
          : {
              line: false,
              ticks: {
                values: [lo, hi],
                size: 0,
                padding: TICK_PADDING,
                format: (tick) =>
                  t("common:number", { value: displayPrice(tick) }),
              },
              tickLabels: {
                fontSize: tickFontSize,
                anchor: ({ value }) =>
                  value === (flipped ? hi : lo) ? "start" : "end",
              },
            },
      },
      y: {
        scale: scaleLinear().domain([0, ceiling]),
        grid: true,
        axis: false,
      },
      color: {
        domain: ["token1", "token0", "background"],
        range: [colors.token1, colors.token0, colors.background],
      },
      tooltip: {
        use: tooltip,
        // the tooltip is taller than the chart; portal it so it can overflow
        // the chart vertically instead of being clamped over the bars
        portal,
        sticky: false,
        // placement is static in the library; the anchor resolver runs right
        // before positioning, so it picks the side and the getter reports it
        get placement() {
          return tooltipSide
        },
        anchor: (points, { plot, scales }) => {
          const [bar] = points.filter(isBarPoint)
          const mapX = scales.x?.map
          const mapY = scales.y?.map
          if (!bar || !mapX || !mapY) return null

          // the axis runs backwards when flipped, so sort the edges
          const [left, right] = [mapX(bar.datum.from), mapX(bar.datum.to)].sort(
            (a, b) => a - b,
          ) as [number, number]
          const barTop = mapY(
            Math.max(bar.datum.liquidity, minVisibleLiquidity),
          )
          const plotBottom = plot.y + plot.height

          // short bars leave room above them, so the tooltip sits on top
          if (plotBottom - barTop < plot.height * SHORT_BAR_RATIO) {
            tooltipSide = "top"
            return { x: (left + right) / 2, y: barTop }
          }

          tooltipSide =
            left + right < plot.x * 2 + plot.width ? "right" : "left"

          return {
            x: tooltipSide === "right" ? right : left,
            y: plot.y + plot.height / 2,
          }
        },
      },
    })
  }, [
    bandGap,
    bands,
    bars,
    colors,
    hi,
    lo,
    rangeStyle,
    spotTick,
    t,
    tickBaseline,
    tickFontSize,
    chartDecimals0,
    chartDecimals1,
    ceiling,
    minVisibleLiquidity,
    top,
    scenario,
    managedRangesVisible,
    flipped,
  ])

  if (!bars.length)
    return <ChartState sx={{ height: resolvedHeight }} isEmpty />

  const [base, quote] = vault.pair
  const price0 = priceAtTick(spotTick, token0.decimals, token1.decimals)
  const price = flipped ? 1 / price0 : price0

  return (
    <Flex direction="column" flex={1} sx={{ minHeight: resolvedHeight }}>
      {!scenario && (
        <Flex
          justify="space-between"
          align={["flex-start", "center"]}
          direction={["column", "row"]}
          gap="m"
          mb="m"
          sx={{ flexShrink: 0 }}
        >
          <Flex direction="column" gap="xs">
            <Text fs="p6" color={getToken("text.low")}>
              {t("vaults.chart.currentPrice")}
            </Text>
            <Text fs="p2" fw={500} font="primary">
              {t("vaults.price.pair", {
                value: price,
                symbolA: base.symbol,
                symbolB: quote.symbol,
              })}
            </Text>
            <Text fs="p6" color={getToken("text.low")}>
              {t("vaults.price.pair", {
                value: 1 / price,
                symbolA: quote.symbol,
                symbolB: base.symbol,
              })}
            </Text>
          </Flex>
        </Flex>
      )}

      <Flex
        flex={1}
        direction="column"
        justify="flex-end"
        sx={{ minHeight: 0 }}
      >
        <Flex position="relative" minWidth={0}>
          <Chart
            css={{
              ".ts-chart__grid": { strokeDasharray: "2 4" },
              ".ts-chart-tooltip": { "--ts-chart-tooltip-max-width": "none" },
            }}
            definition={definition}
            ariaLabel={t(
              scenario
                ? "vaults.explainer.chartLabel"
                : "vaults.chart.liquidity",
            )}
            height={resolvedHeight}
            renderTooltipBody={({ points }) => {
              if (scenario) return null

              const [first] = points.filter(isBarPoint)

              if (!first) return null

              return <TickStats bar={first.datum} vault={vault} />
            }}
          />

          {scenario && (
            <>
              {managedRangesVisible &&
                bands.map((managedBand) => {
                  const span = hi - lo
                  const leftFraction = (managedBand.lower - lo) / span
                  const widthFraction =
                    (managedBand.upper - managedBand.lower) / span

                  return (
                    <SManagedBand
                      key={managedBand.id}
                      aria-hidden
                      $rangeColor={rangeStyle(managedBand.id).color}
                      $fillOpacity={rangeStyle(managedBand.id).fillOpacity}
                      $borderOpacity={rangeStyle(managedBand.id).borderOpacity}
                      $opacity={
                        managedBand.id === "previous" ? FADED_OPACITY : 1
                      }
                      position="absolute"
                      top={`${CHART_GUIDE_INSET}px`}
                      bottom={`${CHART_GUIDE_INSET}px`}
                      left={plotCssPos(leftFraction)}
                      width={plotCssWidth(widthFraction)}
                      borderRadius="base"
                    />
                  )
                })}

              <SSpotLine
                aria-hidden
                position="absolute"
                top={`${CHART_GUIDE_INSET}px`}
                bottom={`${CHART_GUIDE_INSET}px`}
                left={plotCssPos(
                  Math.min(1, Math.max(0, (spotTick - lo) / (hi - lo))),
                )}
                width={pxToRem(2)}
                bg={colors.spot}
                transform="translateX(-1px)"
              >
                <Flex
                  position="absolute"
                  top={pxToRem(-4)}
                  left="50%"
                  size={pxToRem(8)}
                  borderRadius="full"
                  bg={colors.spot}
                  transform="translateX(-50%)"
                />
              </SSpotLine>
            </>
          )}
        </Flex>

        <SLiquidityLegend mt="s" wrap>
          {/* left side of the chart first */}
          {(flipped ? [0, 1] : [1, 0]).map((side) => (
            <Legend
              key={side}
              color={side ? colors.token1 : colors.token0}
              label={
                scenario
                  ? t(
                      side
                        ? "vaults.explainer.legend.tokenB"
                        : "vaults.explainer.legend.tokenA",
                    )
                  : t(
                      side
                        ? "vaults.chart.legend.token1"
                        : "vaults.chart.legend.token0",
                      { symbol: (side ? token1 : token0).symbol },
                    )
              }
            />
          ))}
          <Legend color={colors.spot} label={t("vaults.chart.legend.spot")} />
          {scenario
            ? bands.length > 0 && (
                <RangeLegend
                  range={rangeStyle()}
                  label={t("vaults.chart.legend.ranges")}
                  visible={managedRangesVisible}
                  onToggle={() => setManagedRangesVisible((value) => !value)}
                />
              )
            : bands.map((band) => (
                <RangeLegend
                  key={band.id}
                  range={rangeStyle(band.id)}
                  label={
                    band.id === "limit"
                      ? t("vaults.chart.legend.limit")
                      : t("vaults.chart.legend.base")
                  }
                  visible={managedRangesVisible}
                  onToggle={() => setManagedRangesVisible((value) => !value)}
                />
              ))}
          {scenario && (
            <Legend
              color={colors.background}
              label={t("vaults.explainer.legend.otherLps")}
            />
          )}
        </SLiquidityLegend>
      </Flex>
    </Flex>
  )
}

const TickStats = ({ bar, vault }: { bar: Bar; vault: VaultTable }) => {
  const { t } = useTranslation(["liquidity", "common"])
  const [token0, token1] = vault.tokens
  const { decimals: decimals0 } = token0
  const { decimals: decimals1 } = token1
  const { getAssetPrice } = useAssetsPrice([token0.id, token1.id])
  const { themeProps } = useTheme()

  const flipped = vault.pair[0].id !== token0.id
  const from = priceAtTick(bar.rangeFrom, decimals0, decimals1)
  const to = priceAtTick(bar.rangeTo, decimals0, decimals1)
  const [low, high] = flipped ? [1 / to, 1 / from] : [from, to]
  const held = bar.side === "token0" ? token0 : token1
  const state = vault.vault
  const mid = (bar.rangeFrom + bar.rangeTo) / 2
  const managedBands = state ? getManagedBands(mid, state) : []

  const human = (raw: bigint, decimals: number) =>
    t("common:number", {
      value: scaleHuman(raw.toString(), decimals),
      threshold: true,
      thresholdMaximumFractionDigits: 2,
    })

  const usd = (assetId: string, amount: string | number) => {
    const price = getAssetPrice(assetId)
    if (!price?.isValid) return undefined

    return t("common:currency", {
      value: Big(amount).times(price.price).toString(),
    })
  }

  const vaultPositions = state
    ? managedBands.map((band) => ({
        band,
        label: t(
          band === "base"
            ? "vaults.composition.base"
            : "vaults.composition.limit",
        ),
        share:
          bar.liquidity > 0
            ? (Number(state[band].liquidity) / bar.liquidity) * 100
            : null,
        ...state[band],
      }))
    : []

  return (
    <Flex direction="column" gap="s" p="m" minWidth="4xl">
      <Flex justify="space-between" align="center" gap="m">
        <Text
          fs="p5"
          color={getToken("text.high")}
          fontVariantNumeric="tabular-nums"
          whiteSpace="nowrap"
        >
          {t("common:number.range", { from: low, to: high })}
        </Text>
        <Flex align="center" gap="xs">
          {managedBands.map((band) => (
            <Chip
              key={band}
              size="small"
              variant={band === "base" ? "blue" : "orange"}
            >
              {t(
                band === "base"
                  ? "vaults.chart.band.base"
                  : "vaults.chart.band.limit",
              )}
            </Chip>
          ))}
          {bar.current && (
            <Chip size="small" variant="lime">
              {t("vaults.chart.tooltip.current")}
            </Chip>
          )}
        </Flex>
      </Flex>

      <Text fs="p6" color={getToken("text.medium")}>
        {t("vaults.chart.tooltip.locked")}
      </Text>
      <TickStatsRow
        label={held.symbol}
        isSymbolLabel={true}
        icon={<AssetLogo id={held.id} size="extra-small" />}
        value={t("common:number", {
          value: bar.locked,
          threshold: true,
          thresholdMaximumFractionDigits: 2,
        })}
        displayValue={usd(held.id, bar.locked)}
      />

      {vaultPositions.length > 0 && (
        <Stack gap="base" mt="base" separated withLeadingSeparator>
          {vaultPositions.map((position) => (
            <Fragment key={position.band}>
              <Flex align="center" gap="s">
                <RangeSwatch
                  range={managedRangeStyle(themeProps, position.band)}
                />
                <Text fs="p6" color={getToken("text.medium")}>
                  {position.share !== null
                    ? t("vaults.chart.tooltip.vaultShare", {
                        label: position.label,
                        value: position.share,
                      })
                    : position.label}
                </Text>
              </Flex>
              {(flipped
                ? [
                    { token: token1, amount: position.amount1 },
                    { token: token0, amount: position.amount0 },
                  ]
                : [
                    { token: token0, amount: position.amount0 },
                    { token: token1, amount: position.amount1 },
                  ]
              ).map(({ token, amount }) => (
                <TickStatsRow
                  key={token.id}
                  label={token.symbol}
                  isSymbolLabel={true}
                  icon={<AssetLogo id={token.id} size="extra-small" />}
                  value={human(amount, token.decimals)}
                  displayValue={usd(
                    token.id,
                    scaleHuman(amount.toString(), token.decimals),
                  )}
                />
              ))}
            </Fragment>
          ))}
        </Stack>
      )}
    </Flex>
  )
}

const TickStatsRow = ({
  label,
  value,
  displayValue,
  icon,
  isSymbolLabel = false,
}: {
  label: string
  value: string
  displayValue?: string
  icon?: React.ReactNode
  isSymbolLabel?: boolean
}) => (
  <Flex justify="space-between" align="center" gap="xl">
    <Flex align="center" gap="xs">
      {icon}
      <Text
        fs="p6"
        color={getToken(isSymbolLabel ? "text.high" : "text.medium")}
        whiteSpace="nowrap"
      >
        {label}
      </Text>
    </Flex>
    <Flex direction="column" align="flex-end" gap="xxs">
      <Text
        fs="p6"
        lh={1}
        color={getToken("text.high")}
        fontVariantNumeric="tabular-nums"
        whiteSpace="nowrap"
      >
        {value}
      </Text>
      {displayValue && (
        <Text
          fs="p6"
          lh={1}
          color={getToken("text.low")}
          fontVariantNumeric="tabular-nums"
          whiteSpace="nowrap"
        >
          {displayValue}
        </Text>
      )}
    </Flex>
  </Flex>
)
