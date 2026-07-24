import {
  Flex,
  RechartsTooltipProps,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { metricsConfig } from "@/modules/stats/overview/components/MultiMetricChart.utils"
import { SChartTooltipContainer } from "@/modules/stats/overview/components/StatsCHartTooltip.styled"

export const chartTooltipProps = {
  isAnimationActive: false,
  offset: 14,
  allowEscapeViewBox: { x: true, y: true },
  wrapperStyle: {
    transition: "none",
    pointerEvents: "none" as const,
    zIndex: 9999,
  },
} as const

export type TooltipPayloadItem = {
  name: string
  value: number | null
  color: string
  dataKey: string
  payload?: unknown
  assetId?: string
}

export const ChartTooltipContent = ({
  active,
  payload,
}: RechartsTooltipProps) => {
  const { t } = useTranslation("common")
  const content = Array.from(
    (payload?.filter((entry) => entry.value !== null) ?? [])
      .reduce<Map<string, NonNullable<typeof payload>[number]>>(
        (entries, entry) => {
          const name = String(entry.name)
          if (!entries.has(name)) entries.set(name, entry)
          return entries
        },
        new Map(),
      )
      .values(),
  )

  if (!active || !content?.length) return null

  const timestamp = (content[0]?.payload as { timestamp?: number } | undefined)
    ?.timestamp

  return (
    <SChartTooltipContainer data-state="visible">
      <Text fs={12} fw={500} color="text.high">
        {t("date.day", { value: timestamp })}
      </Text>
      {content.map((entry) => {
        const metric =
          metricsConfig[entry.dataKey as keyof typeof metricsConfig]
        const point = entry?.payload as
          | { volumeBar?: number | null }
          | undefined
        const realValue =
          entry?.dataKey === "volumeBarScaled"
            ? (point?.volumeBar ?? entry.value)
            : entry.value

        return (
          <Flex key={entry.dataKey} gap="s" align="center">
            <div
              style={{
                width: 8,
                height: 8,
                backgroundColor: getToken(metric?.color),
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <Flex
              justify="space-between"
              gap="m"
              sx={{ flex: 1, minWidth: 100 }}
            >
              <Text
                fs={10}
                fw={500}
                color="text.medium"
                css={{ textTransform: "uppercase", letterSpacing: "0.02em" }}
              >
                {metric?.label}
              </Text>
              <Text fs={12} fw={500} color="text.high">
                {realValue}
              </Text>
            </Flex>
          </Flex>
        )
      })}
    </SChartTooltipContainer>
  )
}
