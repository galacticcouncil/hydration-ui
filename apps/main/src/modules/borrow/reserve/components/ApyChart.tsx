import {
  Chart,
  ChartLegendTooltipBody,
  Flex,
  Text,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { areaY, defineChart, lineY, ruleY, text } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ReserveApyRate } from "@/api/grafana/reserveRate"
import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import {
  ApyChartTimeRangeOption,
  apyChartTimeRangeOptions,
} from "@/modules/borrow/reserve/components/ApyChart.utils"

const RATE_MARK_ID = "rate"
const GRADIENT_ID = "apy-chart-gradient"
const STROKE_WIDTH = 2
const AVERAGE_LABEL_OFFSET = -8

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

  const definition = useMemo(() => {
    const average = data.reduce((acc, item) => acc + item.rate, 0) / data.length
    // the line snaps to a half-percent step, the label keeps the exact value
    const averageLine = Math.round(average * 2) / 2
    const averageLabel = [
      {
        timestamp: data[0]?.timestamp ?? 0,
        rate: averageLine,
        label: `${t("avg")} ${t("percent", { value: average })}`,
      },
    ]

    return defineChart({
      marks: [
        decorative(
          areaY(data, {
            x: "timestamp",
            y: RATE_MARK_ID,
            fill: `url(#${GRADIENT_ID})`,
          }),
        ),
        lineY(data, {
          id: RATE_MARK_ID,
          x: "timestamp",
          y: RATE_MARK_ID,
          stroke: color,
          strokeWidth: STROKE_WIDTH,
        }),
        decorative(
          ruleY([averageLine], {
            stroke: themeProps.text.medium,
            strokeDasharray: "6 6",
          }),
        ),
        decorative(
          text(averageLabel, {
            x: "timestamp",
            y: RATE_MARK_ID,
            fontSize: 14,
            fontWeight: 600,
            text: "label",
            anchor: "start",
            dy: AVERAGE_LABEL_OFFSET,
            dx: 5,
            fill: themeProps.text.high,
          }),
        ),
      ],
      gradients: [
        {
          id: GRADIENT_ID,
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0.05, color, opacity: 1 },
            { offset: 0.95, color, opacity: 0 },
          ],
        },
      ],
      x: {
        scale: scaleLinear,
        axis: {
          line: false,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("date.day", { value: new Date(value) }),
          },
        },
      },
      y: {
        scale: scaleLinear,
        grid: true,
        axis: {
          line: false,
          ticks: {
            size: 0,
            padding: 8,
            format: (value) => t("percent", { value }),
          },
        },
      },
      focus: "group-x",
      tooltip: {
        use: tooltip,
        sticky: false,
      },
    })
  }, [data, color, themeProps, t])

  return (
    <Flex direction="column" gap="base">
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="s">
          <Flex bg={color} size="2xs" borderRadius="full" />
          <Text fs="p4" fw={500} sx={{ color: getToken("text.medium") }}>
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
        sx={{ height: [100, 250] }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={!data.length}
      >
        <Chart
          definition={definition}
          ariaLabel={header}
          height={[100, 250]}
          renderTooltipBody={({ points }) => (
            <ChartLegendTooltipBody
              points={points.filter(({ markId }) => markId === RATE_MARK_ID)}
              formatLabel={(value) =>
                t("date.daytime", { value: new Date(Number(value)) })
              }
              formatSeriesLabel={() => header}
              formatValue={({ yValue }) => t("percent", { value: yValue })}
            />
          )}
        />
      </ChartState>
    </Flex>
  )
}
