import { AreaChart, Flex, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"

import { useLoyaltyRates } from "./Farms.utils"

export const LoyaltyGraph = ({ farm }: { farm: Farm }) => {
  const { t } = useTranslation("liquidity")
  const { data } = useLoyaltyRates(farm)
  const theme = useTheme()

  return (
    <Flex
      sx={{
        flexDirection: "column",
        gap: 40,
        px: 20,
        py: getTokenPx("containers.paddings.primary"),
        backgroundColor: getToken("surfaces.containers.mid.primary"),
        borderRadius: getTokenPx("containers.cornerRadius.containersPrimary"),
      }}
    >
      <Text fw={500} fs="h7" font="primary">
        {t("liquidity.availableFarms.modal.graph.title")}
      </Text>
      <AreaChart
        aspectRatio="16 / 9"
        data={data ?? []}
        xAxisProps={{
          type: "number",
          interval: "preserveStart",
          height: 50,
          padding: { left: 10, right: 10 },
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
      />
    </Flex>
  )
}
