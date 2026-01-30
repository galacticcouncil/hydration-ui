import { Box, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"

export const FeeAndRevenueLegend = ({
  fields,
  activeFilter,
  setActiveFilter,
}: {
  fields: Map<string, number>
  activeFilter: string
  setActiveFilter: (filter: string) => void
}) => {
  const { t } = useTranslation("common")
  const { getToken } = useTheme()

  const legendItems = useMemo(() => {
    const dataFields = Array.from(fields.entries()).map(([key, value]) => {
      const fieldConfig = feesAndRevenueConfig[key]
      const name = fieldConfig?.label ?? "N/A"
      const color = fieldConfig
        ? getToken(fieldConfig.color)
        : getToken("accents.info.accent")

      return {
        key,
        name,
        color,
        value,
      }
    })

    return [
      {
        key: "all",
        name: t("all"),
        color: undefined,
        value: undefined,
      },
      ...dataFields,
    ]
  }, [fields, getToken, t])

  return (
    <Flex gap="base" wrap>
      {legendItems.map(({ key, name, color, value }) => {
        const isActive = activeFilter === key

        return (
          <Button
            key={key}
            size="small"
            variant={isActive ? "secondary" : "restSubtle"}
            outline={!isActive}
            onClick={() => setActiveFilter(key)}
          >
            {color && <Box width={8} height={8} borderRadius="m" bg={color} />}
            <Text fs={11} fw={500} color="text.high">
              {name}
            </Text>
            {value !== undefined ? (
              <Text fs={11} fw={500} color="text.medium">
                {t("currency", { value })}
              </Text>
            ) : null}
          </Button>
        )
      })}
    </Flex>
  )
}
