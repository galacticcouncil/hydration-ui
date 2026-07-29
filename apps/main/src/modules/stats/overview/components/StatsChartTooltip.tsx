import {
  Box,
  Flex,
  RechartsTooltipProps,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { MultiMetricChartPoint } from "@/api/stats"
import {
  MetricKey,
  metricsConfig,
} from "@/modules/stats/overview/components/MultiMetricChart.utils"
import { SChartTooltipContainer } from "@/modules/stats/overview/components/StatsChartTooltip.styled"

export const chartTooltipProps = {
  isAnimationActive: false,
  offset: 14,
  allowEscapeViewBox: { x: false, y: false },
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
  dataKey: MetricKey
  payload: MultiMetricChartPoint
  assetId?: string
}

type ChartTooltipContentProps = Omit<RechartsTooltipProps, "payload"> & {
  payload?: TooltipPayloadItem[]
}

export const ChartTooltipContent = ({
  active,
  payload,
}: RechartsTooltipProps) => {
  const { t } = useTranslation("common")
  const typedPayload = payload as ChartTooltipContentProps["payload"]
  const content = Array.from(
    (typedPayload?.filter((entry) => entry.value !== null) ?? [])
      .reduce<Map<string, NonNullable<typeof typedPayload>[number]>>(
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

  const timestamp = content[0]?.payload?.timestamp

  return (
    <SChartTooltipContainer data-state="visible">
      <Text fs="p6" fw={500} color={getToken("text.high")}>
        {t("date.day", { value: timestamp })}
      </Text>
      {content.map((entry) => {
        const dataKey = entry.dataKey
        const isVolume = dataKey === "volume"
        const isPrice = dataKey === "hdx"
        const metric = metricsConfig[dataKey]
        const point = entry.payload

        const realValue = isVolume
          ? (point?.volumeBar ?? entry.value)
          : entry.value

        return (
          <Flex key={dataKey} gap="s" align="center">
            <Box
              width={8}
              height={8}
              borderRadius="m"
              bg={getToken(metric?.color)}
            />
            <Flex
              justify="space-between"
              gap="m"
              sx={{ flex: 1, minWidth: 100 }}
            >
              <Text
                fs={pxToRem(10)}
                fw={400}
                color={getToken("text.high")}
                transform="uppercase"
              >
                {metric?.label}
              </Text>
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                {isPrice
                  ? t("currency", {
                      value: realValue,
                      maximumFractionDigits: 4,
                    })
                  : t("currency.compact", {
                      value: realValue,
                    })}
              </Text>
            </Flex>
          </Flex>
        )
      })}
    </SChartTooltipContainer>
  )
}
