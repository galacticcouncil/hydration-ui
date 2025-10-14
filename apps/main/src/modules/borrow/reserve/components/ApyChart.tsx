import { AreaChart, Box, Flex, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ReserveApyRate } from "@/api/grafana/reserveRate"
import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import {
  ApyChartTimeRangeOption,
  apyChartTimeRangeOptions,
} from "@/modules/borrow/reserve/components/ApyChart.utils"

type Props = {
  readonly header: string
  readonly color: string
  readonly timeRange: ApyChartTimeRangeOption
  readonly data: Array<ReserveApyRate>
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onTimeRangeChange: (timeRange: ApyChartTimeRangeOption) => void
}

export const ApyChart: FC<Props> = ({
  header,
  color,
  timeRange,
  data,
  isLoading,
  isError,
  onTimeRangeChange,
}) => {
  const { t } = useTranslation()
  const { themeProps } = useTheme()

  const average = data.reduce((acc, item) => acc + item.rate, 0) / data.length

  return (
    <Flex direction="column" gap={20}>
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={6}>
          <span
            css={{ borderRadius: "100%" }}
            sx={{ display: "block", width: 6, height: 6, bg: color }}
          />
          <Text fs={14} fw={500} sx={{ color: getToken("text.medium") }}>
            {header}
          </Text>
        </Flex>
        <ChartTimeRange
          options={apyChartTimeRangeOptions}
          selectedOption={timeRange}
          onSelect={onTimeRangeChange}
        />
      </Flex>
      <ChartState
        sx={{ aspectRatio: "2.5 / 1" }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={!data.length}
      >
        <AreaChart
          curveType="linear"
          aspectRatio="2.5 / 1"
          withoutReferenceLine
          verticalGridHidden
          horizontalGridHidden={false}
          data={data}
          xAxisProps={{
            interval: "preserveEnd",
            minTickGap: 30,
          }}
          config={{
            series: [
              {
                key: "rate",
                color,
              },
            ],
            xAxisKey: "timestamp",
            xAxisFormatter: (value) =>
              t("date.day", { value: new Date(value) }),
            tooltipFormatter: (value) =>
              t("date.daytime", { value: new Date(value) }),
            yAxisFormatter: (value) => t("percent", { value }),
          }}
          referenceLines={[
            {
              y: Math.round(average * 2) / 2,
              stroke: themeProps.text.medium,
              strokeDasharray: "6 6",
              shapeRendering: "crispEdges",
              label: (props) => (
                <ReferenceLineLabel
                  {...props}
                  value={average}
                  xOffset={-5}
                  yOffset={25}
                  title={t("avg")}
                />
              ),
            },
          ]}
        />
      </ChartState>
    </Flex>
  )
}

const ReferenceLineLabel = (props: {
  value: number
  title: string
  yOffset?: number
  xOffset?: number
  color: string
  viewBox: {
    x: number
    y: number
  }
}) => {
  const { t } = useTranslation()
  const yOffset = props.yOffset ?? 0
  const xOffset = props.xOffset ?? 0

  return (
    <foreignObject
      sx={{ overflow: "visible" }}
      height={1}
      width={1}
      x={props.viewBox.x - xOffset}
      y={props.viewBox.y - yOffset}
    >
      <Box
        bg={getToken("details.tooltips")}
        color={getToken("text.high")}
        p={4}
        borderRadius="md"
        width="min-content"
      >
        <Text fs={12} fw={500} lh={1} whiteSpace="nowrap" align="center">
          {props.title} {t("percent", { value: props.value })}
        </Text>
      </Box>
    </foreignObject>
  )
}
