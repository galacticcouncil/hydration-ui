import { Tooltip } from "recharts"

import { Flex, Grid, Text } from "@/components"
import { ChartCrosshair, useChart } from "@/components/Chart"
import { STooltipContainer } from "@/components/Chart/ChartTooltip.styled"
import {
  dateFormatter,
  getColorSet,
  timeFormatter,
} from "@/components/Chart/utils"
import { useTheme } from "@/theme"
import { getToken } from "@/utils"

type RechartsTooltipProps = React.ComponentProps<typeof Tooltip>

const ChartTooltipLegendLabel = ({
  payload = [],
  labelFormatter,
}: RechartsTooltipProps) => {
  const { config } = useChart()

  if (!payload.length) return null

  const [item] = payload
  const value = item.payload[config.xAxisKey]

  const formattedValue = labelFormatter ? labelFormatter(value, payload) : value

  return (
    <Text fs={14} fw={500} align="left">
      {formattedValue}
    </Text>
  )
}

export const ChartTooltipLegendType = ({
  active,
  payload,
  labelFormatter,
  formatter,
}: RechartsTooltipProps) => {
  const { config } = useChart()
  const { themeProps: theme } = useTheme()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <STooltipContainer>
      <ChartTooltipLegendLabel
        payload={payload}
        labelFormatter={labelFormatter}
      />
      <Grid gap={4}>
        {payload.map((item, index) => {
          const key = `${item.name || item.dataKey || "value"}`
          const itemConfig = config.series.find((s) => s.key === key)

          const colors = getColorSet(itemConfig?.color, theme.details.chart)

          const formatted =
            formatter && item?.value !== undefined && item.name
              ? formatter(item.value, item.name, item, index, item.payload)
              : item.value

          return (
            <Flex gap={8} align="center" key={item.dataKey}>
              <Flex
                sx={{
                  background: colors.primary,
                  flexShrink: 0,
                  size: 10,
                  borderRadius: 2,
                }}
              />
              <Flex justify="space-between" gap={20} sx={{ flex: 1 }}>
                <Text color={getToken("text.medium")} fs={14} fw={500} lh={1}>
                  {itemConfig?.label || item.name}
                </Text>
                <Text
                  color={getToken("text.high")}
                  fs={14}
                  fw={500}
                  lh={1}
                  align="end"
                  sx={{
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatted}
                </Text>
              </Flex>
            </Flex>
          )
        })}
      </Grid>
    </STooltipContainer>
  )
}

export const ChartTooltipTimeType = ({
  active,
  payload,
  coordinate,
}: React.ComponentProps<typeof Tooltip>) => {
  const { config } = useChart()

  if (!active || !payload?.length || !coordinate) {
    return null
  }

  if (config.xAxisType !== "time") {
    throw new Error("Tooltip type and xAxisType are not compatible")
  }

  const [item] = payload
  const value = item.payload[config.xAxisKey]

  const placement = config.tooltipType === "timeBottom" ? "bottom" : "top"

  return (
    <div
      css={{
        position: "absolute",
        width: "fit-content",
        left: coordinate.x,
        transform: "translateX(-50%)",
        [placement]: 0,
      }}
    >
      <ChartCrosshair
        date={dateFormatter.format(value)}
        time={timeFormatter.format(value)}
      />
    </div>
  )
}

export const ChartTooltip = (props: React.ComponentProps<typeof Tooltip>) => {
  const { config } = useChart()

  if (config.tooltipType === "none") {
    return null
  }

  if (config.tooltipType === "legend") {
    return <ChartTooltipLegendType {...props} />
  }

  return <ChartTooltipTimeType {...props} />
}
