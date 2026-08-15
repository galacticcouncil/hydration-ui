import { Box, Flex, Text } from "@galacticcouncil/ui/components"
import { ChartPoint } from "@tanstack/charts/react/tooltip"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { SChartTooltipContainer } from "@/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue.styled"
import { FeeRow } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesStackedBar"

type FeesTooltipContentProps = {
  readonly points: readonly ChartPoint<FeeRow>[]
}

export const FeesTooltipContent = ({ points }: FeesTooltipContentProps) => {
  const { t } = useTranslation("common")
  if (!points.length) return null

  const [first] = points
  const sum = points.reduce((acc, { datum }) => acc + datum.value, 0)

  return (
    <SChartTooltipContainer>
      <Flex justify="space-between" align="center" gap="m">
        <Text fs="p5" fw={600} color="text.high">
          {t("date.day", { value: first?.datum.time, format: "yyyy MMM dd" })}
        </Text>
        {points.length > 1 && (
          <Text fs="p5" fw={600} color="text.high">
            {t("currency", { value: sum })}
          </Text>
        )}
      </Flex>

      {points.map(({ key, datum, color }) => (
        <Flex key={key} gap={8} align="center">
          <Box
            width="2xs"
            height="2xs"
            borderRadius="l"
            bg={color}
            sx={{ flexShrink: 0 }}
          />
          <Flex justify="space-between" gap="xl" flex={1}>
            <Text fs="p6" fw={500} color="text.medium" transform="uppercase">
              {feesAndRevenueConfig[datum.stream]?.label ?? datum.stream}
            </Text>
            <Text fs="p5" fw={500} color="text.high">
              {t("currency", { value: datum.value })}
            </Text>
          </Flex>
        </Flex>
      ))}
    </SChartTooltipContainer>
  )
}
