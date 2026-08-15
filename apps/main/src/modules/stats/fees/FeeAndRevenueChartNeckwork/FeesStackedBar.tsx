import { useTheme } from "@galacticcouncil/ui/theme"
import { barY, defineChart, stack } from "@tanstack/charts"
import { motion } from "@tanstack/charts/motion"
import { RendererChart } from "@tanstack/charts/react/tooltip"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeesTooltipContent } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesTooltipContent"

/** Long-format row: one per (bucket, stream) pair. Absent pairs are omitted. */
export type FeeRow = {
  time: number
  stream: string
  value: number
}

type FeesStackedBarProps = {
  readonly rows: readonly FeeRow[]
  /** Stack order, bottom first. Must be explicit — see fees-chart-brief.md. */
  readonly streams: readonly string[]
  readonly height: number
}

const BAR_RADIUS = 4
const BAR_GAP = 2

const formatBucket = (time: number) =>
  new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

const renderer = motion<FeeRow, number, number>({
  initial: "always",
  transition: {
    type: "spring",
    stiffness: 170,
    damping: 18,
    mass: 1,
  },
})

export const FeesStackedBar = ({
  rows,
  streams,
  height,
}: FeesStackedBarProps) => {
  const { t } = useTranslation(["common", "stats"])
  const { getToken, themeProps, theme } = useTheme()

  const background = themeProps.surfaces.themeBasePalette.surfaceHigh

  const tickValues = useMemo(() => {
    const times = [...new Set(rows.map(({ time }) => time))].sort(
      (a, b) => a - b,
    )
    if (times.length <= 30) return undefined
    const step = Math.ceil(times.length / 8)
    return times.filter((_, index) => (times.length - 1 - index) % step === 0)
  }, [rows])

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barY(rows, {
            x: "time",
            y: "value",
            color: "stream",
            layout: stack({ order: streams }),
            radius: BAR_RADIUS,
            // a background-coloured outline is the gap: no layout cost, and
            // adjacent segments each paint half of it
            stroke: background,
            strokeWidth: BAR_GAP,
          }),
        ],
        x: {
          scale: () => scaleBand<number>().padding(0.3),
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 8,
              values: tickValues,
              format: formatBucket,
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
              count: 4,
              format: (value) => t("currency.compact", { value }),
            },
          },
        },
        color: {
          domain: streams,
          range: streams.map((key) =>
            getToken(feesAndRevenueConfig[key]?.color ?? "accents.info.accent"),
          ),
        },
        focus: "group-x",
        tooltip: {
          use: tooltip,
          sort: "color-domain",
          anchor: { x: "value", y: "plot-top" },
          placement: "top",
          motion: { type: "tween", easing: "ease-out", duration: 150 },
        },
      }),
    [rows, streams, getToken, t, background, tickValues],
  )

  return (
    <RendererChart
      renderer={renderer}
      css={{
        "--ts-chart-tooltip-background":
          theme === "light"
            ? themeProps.surfaces.themeBasePalette.surfaceHigh
            : themeProps.details.tooltips,

        "--ts-chart-tooltip-border": "none",
        "--ts-chart-tooltip-border-radius": themeProps.radii.base,
        "--ts-chart-tooltip-shadow": "0px 8px 30px 0px rgba(41, 41, 60, 0.41)",
        "--ts-chart-tooltip-padding": "0",
        "--ts-chart-tooltip-max-width": "none",
        "--ts-chart-tooltip-color": "inherit",
        "--ts-chart-tooltip-font": "inherit",
      }}
      definition={definition}
      ariaLabel={t("stats:fees.chart.ariaLabel")}
      height={height}
      renderTooltipBody={({ points }) => <FeesTooltipContent points={points} />}
    />
  )
}
