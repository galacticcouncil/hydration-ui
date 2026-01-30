import {
  Box,
  Flex,
  RechartsTooltipProps,
  Text,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/components/FeeAndRevenue.utils"
import { SChartTooltipContainer } from "@/modules/stats/fees/components/FeesAndRevenue.styled"

export const CustomTooltipContent = ({
  active,
  payload,
  label,
}: RechartsTooltipProps) => {
  const { t } = useTranslation("common")
  if (!active || !payload?.length) return null

  const sum = payload.reduce((acc, { value }) => acc + (Number(value) ?? 0), 0)

  return (
    <SChartTooltipContainer>
      <Flex justify="space-between" align="center" gap="m">
        <Text fs="p5" fw={600} color="text.high">
          {t("date.day", { value: label, format: "yyyy MMM dd" })}
        </Text>
        <Text fs="p5" fw={600} color="text.high">
          {t("currency", { value: sum })}
        </Text>
      </Flex>

      {[...payload].reverse().map((entry, index) => {
        const dataKey = entry.dataKey
        const configKey = typeof dataKey === "string" ? dataKey : undefined
        const fieldConfig =
          configKey != null ? feesAndRevenueConfig[configKey] : undefined

        return (
          <Flex key={configKey ?? index} gap={8} align="center">
            <Box
              width="2xs"
              height="2xs"
              borderRadius="l"
              bg={entry.color}
              sx={{ flexShrink: 0 }}
            />
            <Flex justify="space-between" gap="xl" flex={1}>
              <Text fs="p6" fw={500} color="text.medium" transform="uppercase">
                {fieldConfig?.label ?? "N/A"}
              </Text>
              <Text fs="p5" fw={500} color="text.high">
                {t("currency", { value: entry.value })}
              </Text>
            </Flex>
          </Flex>
        )
      })}
    </SChartTooltipContainer>
  )
}
