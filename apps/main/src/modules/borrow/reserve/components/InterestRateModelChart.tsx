import {
  getInterestRates,
  InterestRateModelOpts,
} from "@galacticcouncil/money-market/utils"
import { Chart, ChartLegendTooltipBody } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { bigShift } from "@galacticcouncil/utils"
import { areaY, defineChart, lineY, ruleX, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

export type InterestRateModelChartProps = {
  config: InterestRateModelOpts
}

const RATE_MARK_ID = "variableRate"
const STROKE_WIDTH = 5
const OPTIMAL_LABEL_OFFSET = 10
const CURRENT_LABEL_OFFSET = 32

export const InterestRateModelChart: React.FC<InterestRateModelChartProps> = ({
  config,
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { themeProps } = useTheme()

  const rates = useMemo(() => getInterestRates(config), [config])

  const optimalValue = bigShift(config.optimalUsageRatio, -27)
    .mul(100)
    .toNumber()

  const currentValue = Big(config.utilizationRate).mul(100).toNumber()

  const definition = useMemo(() => {
    // the lines snap to a half-percent step, the labels keep the exact value
    const optimalLine = Math.round(optimalValue * 2) / 2
    const currentLine = Math.round(currentValue * 2) / 2

    const topRate = Math.max(...rates.map(({ variableRate }) => variableRate))
    const rateColor = themeProps.colors.basePalette.coralPink

    const labels = [
      {
        utilization: optimalLine,
        variableRate: topRate,
        label: `${t("borrow:utilization.optimal")} ${t("percent", {
          value: optimalValue,
        })}`,
        anchor: optimalValue > 50 ? ("end" as const) : ("start" as const),
        dy: OPTIMAL_LABEL_OFFSET,
        dx: optimalValue > 50 ? -10 : 10,
      },
      {
        utilization: currentLine,
        variableRate: topRate,
        label: `${t("borrow:utilization.current")} ${t("percent", {
          value: currentValue,
        })}`,
        anchor: currentValue > 50 ? ("end" as const) : ("start" as const),
        dy: CURRENT_LABEL_OFFSET,
        dx: currentValue > 50 ? -10 : 10,
      },
    ]

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
        ruleX([currentLine, optimalLine], {
          stroke: themeProps.colors.skyBlue[600],
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
            fill: themeProps.colors.skyBlue[600],
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
  }, [rates, optimalValue, currentValue, themeProps, t])

  return (
    <Chart
      definition={definition}
      ariaLabel={t("borrow:utilization.rate")}
      aspectRatio={["2 / 1", "4 / 1"]}
      renderTooltipBody={({ points }) => (
        <ChartLegendTooltipBody
          label={t("borrow:utilization.rate")}
          points={points.filter(({ markId }) => markId === RATE_MARK_ID)}
          formatLabel={(value) => t("percent", { value })}
          formatSeriesLabel={() => t("borrow:market.table.borrowAprVariable")}
          formatValue={({ yValue }) =>
            t("percent", { value: Number(yValue) * 100 })
          }
        />
      )}
    />
  )
}
