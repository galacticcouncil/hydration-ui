import { CrosshairDot } from "@galacticcouncil/ui/assets/icons"
import { AreaChart } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"

import { useLoyaltyRates } from "./Farms.utils"

export const LoyaltyGraph = ({
  farm,
  periodsInFarm,
}: {
  farm: Farm
  periodsInFarm?: number
}) => {
  const { t } = useTranslation("liquidity")
  const { data } = useLoyaltyRates(farm, periodsInFarm)
  const theme = useTheme()

  return (
    <AreaChart
      aspectRatio="16 / 9"
      data={data ?? []}
      withoutActiveDot
      xAxisProps={{
        type: "number",
        interval: 0,
        height: 50,
        padding: { left: 10, right: 10 },
        tickCount: 10,
        domain: [0, "auto"],
      }}
      yAxisProps={{
        padding: { bottom: 16 },
      }}
      yAxisLabel={t("liquidity.availableFarms.modal.graph.yAxisLabel")}
      yAxisLabelProps={{
        dx: 0,
        fill: theme.getToken("text.tint.primary"),
      }}
      xAxisLabelProps={{
        dx: 0,
        dy: 0,
        fill: theme.getToken("text.tint.primary"),
        position: "insideBottom",
      }}
      xAxisLabel={t("liquidity.availableFarms.modal.graph.xAxisLabel")}
      strokeWidth={4}
      withoutReferenceLine
      withoutTooltip
      horizontalGridHidden={false}
      gradient="none"
      config={{
        xAxisKey: "x",
        tooltipType: "none",
        yAxisFormatter: (value) => `${value}%`,
        series: [
          {
            key: "y",
            label: "Value",
            color: theme.getToken("text.tint.primary"),
          },
        ],
      }}
      customDot={({ key, payload, cx = 0, cy = 0 }) => (
        <>
          {payload.current && (
            <CrosshairDot
              key={key}
              x={cx - 7}
              y={cy - 7}
              color={theme.themeProps.icons.primary}
            />
          )}
        </>
      )}
    />
  )
}
