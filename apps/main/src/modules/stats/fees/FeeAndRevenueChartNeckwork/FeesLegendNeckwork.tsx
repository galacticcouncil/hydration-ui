import { Box, Button, Flex, Select, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"

export type FeesLegendFields = ReadonlyMap<string, number | null>

export const FeesLegendNeckwork = ({
  fields,
  activeFilter,
  setActiveFilter,
}: {
  fields: FeesLegendFields
  activeFilter: string
  setActiveFilter: (filter: string) => void
}) => {
  const { t } = useTranslation("common")
  const { getToken } = useTheme()
  const { gte } = useBreakpoints()

  const legendItems = [
    {
      key: "all",
      label: t("all"),
      color: undefined,
      value: undefined,
    },
    ...Array.from(fields.entries()).map(([key, value]) => {
      const fieldConfig = feesAndRevenueConfig[key]

      return {
        key,
        label: fieldConfig?.label ?? "N/A",
        color: getToken(fieldConfig?.color ?? "accents.info.accent"),
        value,
      }
    }),
  ]

  if (!gte("md")) {
    return (
      <Select
        value={activeFilter}
        items={legendItems}
        onValueChange={(val: string) => setActiveFilter(val)}
      />
    )
  }

  return (
    <Flex gap="s" wrap>
      {legendItems.map(({ key, label, color, value }) => {
        const isActive = activeFilter === key
        const hasFailed = value === null

        if (key !== "all" && Big(value || "0").lte(0)) {
          return null
        }

        return (
          <Button
            key={key}
            size="small"
            sx={{ px: "m" }}
            variant={isActive ? "secondary" : "restSubtle"}
            outline={!isActive}
            onClick={() => setActiveFilter(key)}
          >
            {color && (
              <Box
                width="2xs"
                height="2xs"
                borderRadius="full"
                bg={color}
                sx={{ opacity: hasFailed ? 0.3 : 1 }}
              />
            )}
            <Text
              fs="0.65rem"
              fw={500}
              color={!isActive ? getToken("text.high") : undefined}
            >
              {label}
            </Text>
            {value !== undefined ? (
              <Text fs="0.65rem" fw={500}>
                {hasFailed ? "—" : t("currency.compact", { value })}
              </Text>
            ) : null}
          </Button>
        )
      })}
    </Flex>
  )
}
