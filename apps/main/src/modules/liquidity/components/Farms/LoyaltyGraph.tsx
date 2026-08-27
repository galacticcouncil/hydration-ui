import { Chart } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { areaY, defineChart, dot, lineY } from "@tanstack/charts"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"

import { useLoyaltyRates } from "./Farms.utils"

const STROKE_WIDTH = 3
const DOT_RADIUS = 6

export const LoyaltyGraph = ({
  farm,
  periodsInFarm,
}: {
  farm: Farm
  periodsInFarm?: number
}) => {
  const { t } = useTranslation("liquidity")
  const { data } = useLoyaltyRates(farm, periodsInFarm)
  const { getToken, themeProps } = useTheme()

  const definition = useMemo(() => {
    const rows = data ?? []

    return defineChart({
      focus: false,
      marks: [
        areaY(rows, {
          x: "x",
          y: "y",
          fill: "none",
        }),
        lineY(rows, {
          x: "x",
          y: "y",
          stroke: getToken("text.tint.primary"),
          strokeWidth: STROKE_WIDTH,
        }),
        dot(
          rows.filter(({ current }) => current),
          {
            x: "x",
            y: "y",
            r: DOT_RADIUS,
            fill: themeProps.icons.primary,
          },
        ),
      ],
      x: {
        scale: scaleLinear,
        grid: true,
        axis: {
          line: false,
          ticks: { count: 10, size: 0, padding: 8 },
          label: t("liquidity.availableFarms.modal.graph.xAxisLabel"),
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
            format: (value) => `${value}%`,
          },
          label: t("liquidity.availableFarms.modal.graph.yAxisLabel"),
        },
      },
    })
  }, [data, getToken, themeProps, t])

  return (
    <Chart
      definition={definition}
      ariaLabel={t("liquidity.availableFarms.modal.graph.title")}
      aspectRatio="16 / 9"
    />
  )
}
