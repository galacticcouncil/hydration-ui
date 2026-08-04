import {
  Box,
  Button,
  ChartConfig,
  ChartTimeRange,
  ComposedChart,
  Flex,
  Separator,
  Stack,
  Text,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getSpacingValue } from "@galacticcouncil/ui/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useProxyUrl, useSquidClient } from "@/api/provider"
import { multiMetricChartDataQuery, MultiMetricChartPoint } from "@/api/stats"
import { ChartState } from "@/components/ChartState"
import {
  METRIC_KEYS,
  MetricKey,
  metricsConfig,
  TIME_RANGES,
  TimeRange,
  VOLUME_BAR_SCALE_BY_RANGE,
  VOLUME_BAR_SIZE_BY_RANGE,
} from "@/modules/stats/overview/components/MultiMetricChart.utils"
import {
  ChartTooltipContent,
  chartTooltipProps,
} from "@/modules/stats/overview/components/StatsChartTooltip"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetPrice, useDisplayAssetStore } from "@/states/displayAsset"
import { NATIVE_ASSET_ID } from "@/utils/consts"

const hasMetricValue = (point: MultiMetricChartPoint, metric: MetricKey) =>
  metric === "volume" ? point.volumeBar !== null : point[metric] !== null

export const MultiMetricChart = () => {
  const { t } = useTranslation("common")
  const { themeProps: theme, getToken } = useTheme()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()
  const squidClient = useSquidClient()
  const indexerUrl = useProxyUrl()
  const displayAssetId =
    useDisplayAssetStore((state) => state.stableCoinId) ?? ""
  const { price: liveHdxPrice } = useAssetPrice(NATIVE_ASSET_ID)
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y")
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    new Set(METRIC_KEYS),
  )
  const {
    data: chartData = [],
    isLoading: isChartLoading,
    isError: isChartError,
  } = useQuery(
    multiMetricChartDataQuery(
      queryClient,
      rpc,
      squidClient,
      indexerUrl,
      displayAssetId,
      timeRange,
    ),
  )

  const toggleMetric = (metric: MetricKey) => {
    const newSet = new Set(selectedMetrics)
    if (newSet.has(metric)) {
      newSet.delete(metric)
    } else {
      newSet.add(metric)
    }
    setSelectedMetrics(newSet)
  }

  const volumeBarScale = VOLUME_BAR_SCALE_BY_RANGE[timeRange]

  const aggregates = useMemo(() => {
    if (chartData.length === 0) return { tvl: 0, volume: 0 }

    const latestTvl =
      chartData.findLast((point) => point.tvl !== null)?.tvl ?? 0

    return {
      tvl: latestTvl,
      volume: chartData.reduce((acc, curr) => acc + (curr.volumeBar ?? 0), 0),
    }
  }, [chartData])

  const activeMetrics = Array.from(selectedMetrics)

  const isMetricAxisVolumeOnly =
    selectedMetrics.size === 1 && selectedMetrics.has("volume")

  const isChartEmpty =
    selectedMetrics.size === 0 ||
    !chartData.some((point) =>
      activeMetrics.some((metric) => hasMetricValue(point, metric)),
    )

  const chartConfig = useMemo(() => {
    const series = activeMetrics.map((metric) => {
      const isVolume = metric === "volume"
      if (isVolume) {
        return {
          key: "volume" as const,
          label: metricsConfig.volume.label,
          type: "bar" as const,
          yAxisId: metricsConfig.volume.yAxisId,
          color: getToken(metricsConfig.volume.color) as string,
          fillOpacity: 0.92,
          barSize: VOLUME_BAR_SIZE_BY_RANGE[timeRange],
          radius: [3, 3, 0, 0] as [number, number, number, number],
        }
      } else {
        const metricConfig = metricsConfig[metric]
        const color = getToken(metricConfig.color)
        return {
          key: metric,
          label: metricConfig.label,
          type: "area" as const,
          yAxisId: metricConfig.yAxisId,
          color: [color, color, 0.4, 0] as [string, string, number, number],
          curveType: (metric === "hdx" ? "linear" : "monotone") as
            | "linear"
            | "monotone",
          fillOpacity: 1,
          withoutDot: true,
          connectNulls: true,
        }
      }
    })

    return {
      xAxisKey: "timestamp" as const,
      xAxisFormatter: (value) =>
        t("date.day", { value: new Date(Number(value)) }),
      series,
    } satisfies ChartConfig<MultiMetricChartPoint>
  }, [activeMetrics, getToken, t, timeRange])

  const yAxes = useMemo(
    () => [
      {
        yAxisId: "metric",
        tick: { fill: theme.text.medium, fontSize: 11 },
        axisLine: { stroke: theme.text.medium },
        tickFormatter: (v: number) =>
          t("currency.compact", {
            value: isMetricAxisVolumeOnly
              ? Number(v) / volumeBarScale
              : Number(v),
          }),
        width: 55,
      },
      ...(selectedMetrics.has("hdx")
        ? [
            {
              yAxisId: "price",
              orientation: "right" as const,
              tick: { fill: getToken(metricsConfig.hdx.color), fontSize: 11 },
              axisLine: { stroke: getToken(metricsConfig.hdx.color) },
              tickFormatter: (v: number) =>
                t("currency.compact", {
                  value: Number(v),
                  maximumFractionDigits: 4,
                }),
              width: 70,
            },
          ]
        : []),
    ],
    [
      isMetricAxisVolumeOnly,
      volumeBarScale,
      selectedMetrics,
      getToken,
      t,
      theme.text.medium,
    ],
  )

  return (
    <Box width="100%">
      <Flex justify="space-between" align="center" gap="base" wrap>
        <Flex gap="base" wrap>
          {METRIC_KEYS.map((key) => {
            const isActive = selectedMetrics.has(key)
            const config = metricsConfig[key]

            return (
              <Button
                key={key}
                size="small"
                variant={isActive ? "secondary" : "restSubtle"}
                outline={!isActive}
                onClick={() => toggleMetric(key)}
              >
                <Box
                  width={8}
                  height={8}
                  borderRadius="m"
                  bg={getToken(config.color)}
                />
                <Text fs={11} fw={500} color="text.high">
                  {config.label}
                </Text>
              </Button>
            )
          })}
        </Flex>

        <ChartTimeRange
          selectedOption={timeRange}
          options={TIME_RANGES}
          onSelect={(value) => setTimeRange(value)}
        />
      </Flex>

      <Stack
        direction="row"
        justify="start"
        mt="base"
        mb="xl"
        gap="xl"
        separated
        separator={
          <Separator orientation="vertical" my={getSpacingValue("quart")} />
        }
      >
        {activeMetrics.map((metric) => {
          const isPrice = metric === "hdx"
          return (
            <ValueStats
              key={metric}
              size="small"
              wrap
              skeletonWidth={60}
              isLoading={isChartLoading}
              customLabel={
                <Flex align="center" gap="s">
                  <Box
                    width={8}
                    height={8}
                    borderRadius="m"
                    bg={getToken(metricsConfig[metric].color)}
                  />
                  <Text fs="p6" color="text.low">
                    {metricsConfig[metric].label}
                  </Text>
                </Flex>
              }
              customValue={
                <ValueStatsValue
                  size="small"
                  sx={{ color: getToken(metricsConfig[metric].color) }}
                >
                  {t("currency.compact", {
                    value: isPrice ? Number(liveHdxPrice) : aggregates[metric],
                    maximumFractionDigits: isPrice ? 4 : undefined,
                  })}
                </ValueStatsValue>
              }
            />
          )
        })}
      </Stack>

      <ChartState
        isLoading={isChartLoading}
        isError={isChartError}
        isEmpty={isChartEmpty}
        sx={{ height: 340 }}
      >
        <Box position="relative">
          <ComposedChart
            data={chartData}
            config={chartConfig}
            height={340}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            barCategoryGap={0}
            horizontalGridHidden={false}
            verticalGridHidden={false}
            gridStroke={theme.details.separators}
            gridStrokeDasharray="3 3"
            gridOpacity={1}
            withoutReferenceLine
            yAxes={yAxes}
            xAxisProps={{
              tick: { fill: theme.text.medium, fontSize: 11 },
              axisLine: { stroke: theme.details.separators },
              minTickGap: 20,
            }}
            customTooltipContent={ChartTooltipContent}
            tooltipCursor={{
              fill: theme.surfaces.containers.high.hover,
            }}
            tooltipProps={chartTooltipProps}
          />
        </Box>
      </ChartState>
    </Box>
  )
}
