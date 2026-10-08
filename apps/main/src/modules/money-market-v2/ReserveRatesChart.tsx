import { useMoneyMarket } from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  Chart,
  ChartLegend,
  ChartLegendTooltipBody,
  Flex,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import {
  areaY,
  defineChart,
  dot,
  lineY,
  ruleY,
  text,
  whenFocused,
} from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { portal } from "@tanstack/charts/tooltip/portal"
import { useQuery } from "@tanstack/react-query"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import {
  ApyChartTimeRangeOption,
  apyChartTimeRangeOptions,
} from "@/modules/borrow/reserve/components/ApyChart.utils"
import {
  RatePoint,
  reserveRatesQuery,
} from "@/modules/money-market-v2/reserveRates"
import { SDrawIn } from "@/modules/money-market-v2/ReserveRatesChart.styled"

type SeriesKey = "supply" | "borrow"

type Series = {
  key: SeriesKey
  label: string
  color: string
  data: RatePoint[]
  average: number | null
}

const STROKE_WIDTH = 2
const FOCUS_DOT_RADIUS = 4
const AVERAGE_LABEL_ABOVE = -8
const AVERAGE_LABEL_BELOW = 16
// the room an average label takes: a share of the range's width, and pixels
// of height counted from its dashed line
const AVERAGE_LABEL_WIDTH_SHARE = 0.2
const AVERAGE_LABEL_BAND = 22
// ponytail: the plot's pixel height is not known here, so the smaller of the
// chart's two heights stands in; on taller charts the label's band is
// overestimated, which only makes the placement more cautious
const PLOT_HEIGHT = 150
const FADE_OPACITY = 0.8

const gradientId = (key: string) => `reserve-rates-fade-${key}`

const average = (data: RatePoint[]) =>
  data.length ? data.reduce((sum, p) => sum + p.rate, 0) / data.length : null

/**
 * Supply and variable borrow APR history on one chart. Each legend entry
 * toggles its series; each series' average over the range is drawn as a
 * dashed line.
 */
export const ReserveRatesChart: FC<{ reserve: ReserveSummary }> = ({
  reserve,
}) => {
  const { t } = useTranslation()
  const { themeProps } = useTheme()
  const { market } = useMoneyMarket()
  const [timeRange, setTimeRange] = useState<ApyChartTimeRangeOption>("1M")
  const [hidden, setHidden] = useState<ReadonlySet<SeriesKey>>(new Set())

  const { data, isLoading, isError } = useQuery(
    reserveRatesQuery(
      market.addresses.POOL,
      reserve.underlyingAsset,
      timeRange,
    ),
  )

  const series = useMemo((): Series[] => {
    const supply = data?.supply ?? []
    const borrow = data?.borrow ?? []

    return [
      {
        key: "supply" as const,
        label: "Supply APR",
        color: themeProps.accents.info.onPrimary,
        data: supply,
        average: average(supply),
      },
      {
        key: "borrow" as const,
        label: "Borrow APR",
        color: themeProps.colors.basePalette.coralPink,
        data: borrow,
        average: average(borrow),
      },
    ].filter((s) => s.key === "supply" || reserve.borrowingEnabled)
  }, [data, themeProps, reserve.borrowingEnabled])

  const visible = useMemo(
    () => series.filter((s) => !hidden.has(s.key)),
    [series, hidden],
  )

  const toggle = (key: SeriesKey) =>
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(key)) next.add(key)
      // the last visible series stays on, or the chart would be empty
      return next.size === series.length ? current : next
    })

  const dotStroke = themeProps.surfaces.themeBasePalette.surfaceHigh

  const definition = useMemo(() => {
    // the fades end at the lowest plotted value, not at zero, so they do not
    // stretch the y axis
    const rates = visible.flatMap((s) => [
      ...s.data.map((p) => p.rate),
      s.average ?? 0,
    ])
    const floor = Math.min(...rates)
    const band =
      ((Math.max(...rates) - floor) * AVERAGE_LABEL_BAND) / PLOT_HEIGHT
    const first = Math.min(...visible.map((s) => s.data[0]?.timestamp ?? 0))
    const last = Math.max(...visible.map((s) => s.data.at(-1)?.timestamp ?? 0))
    const labelWidth = (last - first) * AVERAGE_LABEL_WIDTH_SHARE

    /** How many line segments, of any visible series, run through a label placed there. */
    const crossings = (level: number, atEnd: boolean, above: boolean) => {
      const from = atEnd ? last - labelWidth : first
      const to = from + labelWidth
      const low = above ? level : level - band
      const high = low + band

      return visible.reduce(
        (count, s) =>
          count +
          s.data.filter((point, i) => {
            const next = s.data[i + 1]
            return (
              next !== undefined &&
              next.timestamp >= from &&
              point.timestamp <= to &&
              Math.max(point.rate, next.rate) >= low &&
              Math.min(point.rate, next.rate) <= high
            )
          }).length,
        0,
      )
    }
    // where the labels placed so far sit, so the next one keeps clear of them
    const taken: Array<{ atEnd: boolean; low: number }> = []
    const fades = Number.isFinite(floor)
      ? visible.map((s) =>
          decorative(
            areaY(s.data, {
              x: "timestamp",
              y1: floor,
              y2: "rate",
              fill: `url(#${gradientId(s.key)})`,
            }),
          ),
        )
      : []

    return defineChart({
      // the built-in ring marks only the nearest point; each line draws its own dot
      focusRing: false,
      // the lines are drawn in by SDrawIn; the library's spring would fight it
      motion: false,
      gradients: visible.map((s) => ({
        id: gradientId(s.key),
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: 0, color: s.color, opacity: FADE_OPACITY },
          { offset: 1, color: s.color, opacity: 0 },
        ],
      })),
      marks: [
        ...fades,
        ...visible.flatMap((s, index) => {
          const avg = s.average ?? 0
          // one label on each side by default, so two close averages do not
          // overlap; a label moves below its line, or to the other side, when
          // fewer lines run through it there
          const ownEnd = index % 2 === 1
          const { atEnd, above, low } = [
            { atEnd: ownEnd, above: true },
            { atEnd: ownEnd, above: false },
            { atEnd: !ownEnd, above: true },
            { atEnd: !ownEnd, above: false },
          ]
            .map((spot) => ({
              ...spot,
              low: spot.above ? avg : avg - band,
            }))
            .filter(
              (spot) =>
                // below a line near the plot's floor the label would land on the x axis ticks
                spot.low >= floor &&
                // two averages can share a level; their labels must not share a spot
                !taken.some(
                  (other) =>
                    other.atEnd === spot.atEnd &&
                    Math.abs(other.low - spot.low) < band,
                ),
            )
            .map((spot) => ({
              ...spot,
              crossings: crossings(avg, spot.atEnd, spot.above),
            }))
            .reduce(
              (best, spot) => (spot.crossings < best.crossings ? spot : best),
              // nothing free: the default spot, above the line at its own end
              {
                atEnd: ownEnd,
                above: true,
                low: avg,
                crossings: Infinity,
              },
            )
          taken.push({ atEnd, low })

          return [
            lineY(s.data, {
              id: s.key,
              x: "timestamp",
              y: "rate",
              // grouped focus keeps one point per group, so each series needs its own
              z: () => s.key,
              stroke: s.color,
              strokeWidth: STROKE_WIDTH,
            }),
            whenFocused(
              dot(s.data, {
                x: "timestamp",
                y: "rate",
                z: () => s.key,
                r: FOCUS_DOT_RADIUS,
                fill: s.color,
                stroke: dotStroke,
                strokeWidth: STROKE_WIDTH,
              }),
              { match: "x" },
            ),
            decorative(
              ruleY([avg], { stroke: s.color, strokeDasharray: "6 6" }),
            ),
            decorative(
              text(
                [
                  {
                    timestamp: atEnd ? last : first,
                    rate: avg,
                    label: `${t("avg")} ${t("percent", { value: avg })}`,
                  },
                ],
                {
                  x: "timestamp",
                  y: "rate",
                  text: "label",
                  fontSize: 12,
                  fontWeight: 600,
                  anchor: atEnd ? "end" : "start",
                  dx: atEnd ? -5 : 5,
                  dy: above ? AVERAGE_LABEL_ABOVE : AVERAGE_LABEL_BELOW,
                  fill: s.color,
                },
              ),
            ),
          ]
        }),
      ],
      x: {
        scale: scaleLinear,
        axis: {
          line: false,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("date.day", { value: new Date(value) }),
          },
        },
      },
      y: {
        scale: scaleLinear,
        grid: true,
        axis: {
          line: false,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("percent", { value }),
          },
        },
      },
      focus: "group-x",
      tooltip: {
        use: tooltip,
        sticky: false,
        // above the plot, clear of the lines; the portal lets it leave the chart box
        portal,
        anchor: { x: "value", y: "plot-top" },
        placement: "top",
      },
    })
  }, [visible, dotStroke, t])

  // by group, not mark: a line and its focus dot share one
  const labelOf = (group: unknown) => series.find((s) => s.key === group)?.label

  return (
    <Flex direction="column" gap="base">
      <Flex justify="space-between" align="center" gap="base" wrap>
        <Flex gap="xl" wrap>
          {series.map((s) => (
            <ChartLegend
              key={s.key}
              color={s.color}
              label={s.label}
              active={!hidden.has(s.key)}
              onClick={() => toggle(s.key)}
            />
          ))}
        </Flex>
        <ChartTimeRange
          options={apyChartTimeRangeOptions}
          selectedOption={timeRange}
          onSelect={setTimeRange}
        />
      </Flex>
      <ChartState
        sx={{ height: [150, 250] }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={visible.every((s) => !s.data.length)}
      >
        <SDrawIn key={timeRange}>
          <Chart
            definition={definition}
            ariaLabel="Supply and borrow APR history"
            height={[150, 250]}
            renderTooltipBody={({ points }) => (
              <ChartLegendTooltipBody
                points={points.filter(({ group }) => !!labelOf(group))}
                formatLabel={(value) =>
                  t("date.daytime", { value: new Date(Number(value)) })
                }
                formatSeriesLabel={({ group }) => labelOf(group)}
                formatValue={({ yValue }) => t("percent", { value: yValue })}
              />
            )}
          />
        </SDrawIn>
      </ChartState>
    </Flex>
  )
}
