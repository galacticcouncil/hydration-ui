import { Chart, chartColorScale } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { barY, defineChart, stack } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeesTooltipContent } from "@/modules/stats/fees/FeeAndRevenueChart/FeesTooltipContent"

export type FeeRow = {
  time: number
  stream: string
  value: number
}

type FeesStackedBarProps = {
  readonly rows: readonly FeeRow[]
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

const focusTransition = {
  type: "tween" as const,
  duration: 350,
  easing: "ease-out" as const,
}

export const FeesStackedBar = ({
  rows,
  streams,
  height,
}: FeesStackedBarProps) => {
  const { t } = useTranslation(["common", "stats"])
  const { getToken, themeProps } = useTheme()

  const background = themeProps.surfaces.themeBasePalette.surfaceHigh

  const definition = useMemo(
    () =>
      defineChart({
        focusRing: false,
        marks: [
          barY(rows, {
            x: "time",
            y: "value",
            color: "stream",
            layout: stack({ order: streams }),
            radius: BAR_RADIUS,
            stroke: background,
            strokeWidth: BAR_GAP,
            fillOpacity: 1,
            states: [
              {
                when: { focus: "unmatched" },
                style: { fillOpacity: 0.5 },
                transition: focusTransition,
              },
              {
                when: { focus: "group" },
                style: { fillOpacity: 1 },
                transition: focusTransition,
              },
            ],
          }),
        ],
        x: {
          scale: () => scaleBand<number>().padding(1),
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 8,
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
        color: chartColorScale(
          Object.fromEntries(
            streams.map((key) => [
              key,
              feesAndRevenueConfig[key]?.color ?? "accents.info.accent",
            ]),
          ),
          getToken,
        ),
        focus: "group-x",
        tooltip: {
          use: tooltip,
          sticky: false,
          sort: "color-domain",
          anchor: { x: "value", y: "plot-top" },
          placement: "top",
          motion: { type: "tween", easing: "ease-out", duration: 150 },
        },
      }),
    [rows, streams, getToken, t, background],
  )

  return (
    <Chart
      definition={definition}
      ariaLabel={t("stats:fees.chart.ariaLabel")}
      height={height}
      renderTooltipBody={({ points }) => <FeesTooltipContent points={points} />}
    />
  )
}
