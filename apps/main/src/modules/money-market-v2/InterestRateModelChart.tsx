import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import { Chart, ChartLegendTooltipBody } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { areaY, defineChart, lineY, ruleX, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

const RATE_MARK_ID = "variableRate"
const STROKE_WIDTH = 5

type Point = { utilization: number; variableRate: number }

/**
 * The variable borrow rate the model gives at each whole percent of
 * utilization: one slope up to the optimal utilization, a second beyond it.
 */
const modelCurve = (reserve: ReserveSummary): Point[] => {
  const base = Number(reserve.baseVariableBorrowRate)
  const slope1 = Number(reserve.variableRateSlope1)
  const slope2 = Number(reserve.variableRateSlope2)
  const optimal = Number(reserve.optimalUsageRatio)

  return Array.from({ length: 101 }, (_, utilization) => {
    const u = utilization / 100
    const variableRate =
      u <= optimal
        ? base + (optimal === 0 ? 0 : (slope1 * u) / optimal)
        : base + slope1 + (slope2 * (u - optimal)) / (1 - optimal)
    return { utilization, variableRate }
  })
}

export const InterestRateModelChart: FC<{ reserve: ReserveSummary }> = ({
  reserve,
}) => {
  const { t } = useTranslation()
  const { themeProps } = useTheme()

  const definition = useMemo(() => {
    const rates = modelCurve(reserve)
    const optimal = Number(reserve.optimalUsageRatio) * 100
    const current = Number(reserve.borrowUsageRatio) * 100
    const topRate = Math.max(...rates.map((point) => point.variableRate))
    const rateColor = themeProps.colors.basePalette.coralPink
    const labelColor = themeProps.colors.skyBlue[600]

    const labels = [
      { utilization: optimal, label: "Optimal", dy: 10 },
      { utilization: current, label: "Current", dy: 32 },
    ].map(({ utilization, label, dy }) => ({
      utilization,
      variableRate: topRate,
      label: `${label} ${t("percent", { value: utilization })}`,
      anchor: utilization > 50 ? ("end" as const) : ("start" as const),
      dx: utilization > 50 ? -10 : 10,
      dy,
    }))

    return defineChart({
      marks: [
        areaY(rates, {
          id: RATE_MARK_ID,
          x: "utilization",
          y: RATE_MARK_ID,
          // invisible hit target; fill still supplies tooltip swatch color
          fill: rateColor,
          fillOpacity: 0,
        }),
        lineY(rates, {
          x: "utilization",
          y: RATE_MARK_ID,
          stroke: rateColor,
          strokeWidth: STROKE_WIDTH,
        }),
        ruleX([current, optimal], {
          stroke: labelColor,
          strokeDasharray: "4 2",
        }),
        decorative(
          text(labels, {
            x: "utilization",
            y: RATE_MARK_ID,
            text: "label",
            anchor: (row) => row.anchor,
            dy: (row) => row.dy,
            dx: (row) => row.dx,
            fontSize: 12,
            fill: labelColor,
          }),
        ),
      ],
      x: {
        scale: scaleLinear,
        axis: {
          line: true,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("percent", { value }),
          },
        },
      },
      y: {
        grid: true,
        scale: scaleLinear,
        axis: {
          line: true,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("percent", { value: value * 100 }),
          },
        },
      },
      focus: "group-x",
      tooltip: {
        use: tooltip,
      },
    })
  }, [reserve, themeProps, t])

  return (
    <Chart
      definition={definition}
      ariaLabel="Interest rate model"
      aspectRatio={["2 / 1", "3 / 1"]}
      renderTooltipBody={({ points }) => (
        <ChartLegendTooltipBody
          label="Utilization"
          points={points.filter(({ markId }) => markId === RATE_MARK_ID)}
          formatLabel={(value) => t("percent", { value })}
          formatSeriesLabel={() => "Variable borrow APR"}
          formatValue={({ yValue }) =>
            t("percent", { value: Number(yValue) * 100 })
          }
        />
      )}
    />
  )
}
