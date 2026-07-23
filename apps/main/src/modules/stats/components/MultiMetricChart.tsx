import styled from "@emotion/styled"
import {
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
} from "@galacticcouncil/indexer/squid"
import {
  Box,
  Separator,
  Text,
  ValueStats,
  ValueStatsValue,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getSpacingValue, getToken } from "@galacticcouncil/ui/utils"
import { isValidBigSource } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, Fragment, useMemo, useState } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useSquidClient, useSquidUrl } from "@/api/provider"
import {
  defillamaHydrationTvlHistoryQuery,
  formatUSD,
  platformDailyVolumeHistoryQuery,
  PlatformVolumeHistoryBucket,
  StatsHistoryPoint,
} from "@/api/stats"
import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import { getTvlColors } from "@/modules/stats/utils/feeColors"
import { useAssetPrice, useDisplayAssetStore } from "@/states/displayAsset"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { numerically, sortBy } from "@/utils/sort"

import { SChartHeader } from "./ChartLayout"
import type { TooltipPayloadItem } from "./StatsChartTooltip"
import { ChartTooltipContent, chartTooltipProps } from "./StatsChartTooltip"

const SChartContainer = styled.div`
  width: 100%;
`

const SControlsGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.base};
  align-items: center;
  align-self: center;
  flex-wrap: wrap;
`

const SMetricButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.s};
  flex-wrap: wrap;
`

const SMetricLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.s};
  font-family: ${({ theme }) => theme.fontFamilies1.secondary};
  font-weight: 400;
  font-size: ${({ theme }) => theme.fontSizes.p6};
  line-height: ${({ theme }) => theme.lineHeights.s};
  color: ${({ theme }) => theme.text.low};
  white-space: nowrap;
`

const SChartSummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.xl};
  margin-top: ${({ theme }) => theme.space.base};
  margin-bottom: ${({ theme }) => theme.space.xl};
`

const SChartState = styled(ChartState)`
  height: 340px;
`

type TimeRange = "7D" | "1M" | "3M" | "1Y" | "ALL"
type MetricKey = "TVL" | "Volume" | "HDX"
type ChartMetricData = {
  date: string
  timestamp: number
  TVL: number | null
  Volume: number | null
  VolumeBar: number | null
  VolumeBarScaled: number | null
  HDX: number | null
}

type HdxPricePoint = {
  timestamp: number
  price: number
}

const VOLUME_BAR_OPACITY = 0.92
const VOLUME_BAR_SIZE_BY_RANGE: Record<TimeRange, number> = {
  "7D": 4,
  "1M": 5,
  "3M": 6,
  "1Y": 7,
  ALL: 7,
}
const VOLUME_BAR_SCALE_BY_RANGE: Record<TimeRange, number> = {
  "7D": 10,
  "1M": 10,
  "3M": 10,
  "1Y": 2.5,
  ALL: 2.5,
}

const ROUND_DIGITS = 10
const formatChartValue = (value: string) =>
  Number(Big(value).round(ROUND_DIGITS, Big.roundDown).toString())

const formatPrice = (value: number) => {
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.01) return `$${value.toFixed(4)}`
  return `$${value.toFixed(6)}`
}

const formatMillionUsd = (value: number | null) =>
  value === null ? "-" : formatUSD(value * 1_000_000)

const getRangeDays = (timeRange: TimeRange) => {
  switch (timeRange) {
    case "7D":
      return 7
    case "1M":
      return 30
    case "3M":
      return 90
    case "1Y":
    case "ALL":
      return 365
  }
}

const getVolumeBucket = (timeRange: TimeRange): PlatformVolumeHistoryBucket => {
  switch (timeRange) {
    case "7D":
      return {
        durationMs: 60 * 60 * 1000,
        period: "_1H_",
      }
    case "1M":
      return {
        durationMs: 12 * 60 * 60 * 1000,
        period: "_12H_",
      }
    case "3M":
    case "1Y":
    case "ALL":
      return {
        durationMs: 24 * 60 * 60 * 1000,
        period: "_24H_",
      }
  }
}

const getUtcBucketStart = (timestamp: number, durationMs: number) =>
  Math.floor(timestamp / durationMs) * durationMs

const getHdxPointTimestamp = (timestamp: number, timeRange: TimeRange) => {
  switch (timeRange) {
    case "1Y":
    case "ALL":
      return getUtcBucketStart(timestamp, 24 * 60 * 60 * 1000)
    default:
      return timestamp
  }
}

const getHdxPriceRangeParams = (timeRange: TimeRange) => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  switch (timeRange) {
    case "7D":
      return {
        startTimestamp: String(now - 7 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["30M"],
      }
    case "1M":
      return {
        startTimestamp: String(now - 30 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["1H"],
      }
    case "3M":
      return {
        startTimestamp: String(now - 90 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["4H"],
      }
    case "1Y":
      return {
        startTimestamp: String(now - 365 * day),
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["1D"],
      }
    case "ALL":
      return {
        startTimestamp: undefined,
        endTimestamp: String(now),
        bucketSize: TimeSeriesBucketTimeRange["7D"],
      }
  }
}

const useHdxPriceChartData = (timeRange: TimeRange) => {
  const squidClient = useSquidClient()
  const displayAssetId = useDisplayAssetStore((state) => state.stableCoinId)
  const { price: hdxSpotPrice, isLoading: isHdxSpotPriceLoading } =
    useAssetPrice(NATIVE_ASSET_ID)
  const rangeParams = useMemo(
    () => getHdxPriceRangeParams(timeRange),
    [timeRange],
  )

  const assetInId = displayAssetId ?? ""
  const assetOutId = NATIVE_ASSET_ID

  const sortedAssets =
    Number(assetOutId) >= Number(assetInId)
      ? ([assetInId, assetOutId] as const)
      : ([assetOutId, assetInId] as const)

  const isAssetInFirst = sortedAssets[0] === assetInId

  const query = tradePricesQuery(
    squidClient,
    sortedAssets[0],
    sortedAssets[1],
    rangeParams.startTimestamp,
    rangeParams.endTimestamp,
    rangeParams.bucketSize,
  )

  const { data, isLoading, isError } = useQuery({
    ...query,
    enabled: !!displayAssetId,
  })

  const prices = useMemo(() => {
    if (isLoading || isHdxSpotPriceLoading || !data) return []

    const prices = data.assetPairPricesAndVolumesByPeriod.nodes
      .flatMap((node) => node?.buckets ?? [])
      .filter((bucket) => isValidBigSource(bucket.priceAvrgNorm))
      .map<HdxPricePoint>((bucket) => ({
        timestamp: getHdxPointTimestamp(
          Number(bucket.timestamp) || 0,
          timeRange,
        ),
        price: formatChartValue(
          isAssetInFirst
            ? Big(1).div(bucket.priceAvrgNorm).toString()
            : bucket.priceAvrgNorm,
        ),
      }))

    const currentPrice =
      hdxSpotPrice && isValidBigSource(hdxSpotPrice) && Big(hdxSpotPrice).gt(0)
        ? formatChartValue(hdxSpotPrice)
        : null

    return [
      ...prices,
      ...(currentPrice
        ? [
            {
              timestamp: getHdxPointTimestamp(Date.now(), timeRange),
              price: currentPrice,
            },
          ]
        : []),
    ].toSorted(
      sortBy({
        select: (point) => point.timestamp,
        compare: numerically,
      }),
    )
  }, [
    data,
    hdxSpotPrice,
    isAssetInFirst,
    isHdxSpotPriceLoading,
    isLoading,
    timeRange,
  ])

  return {
    data: prices,
    isLoading: isLoading || isHdxSpotPriceLoading,
    isError,
  }
}

const distributeVolumeBars = (
  points: ChartMetricData[],
  volumeScale: number,
) => {
  const volumeIndexes = points.reduce<number[]>((acc, point, index) => {
    if (point.VolumeBar !== null) acc.push(index)
    return acc
  }, [])

  if (!volumeIndexes.length) return points

  const nextPoints: ChartMetricData[] = points.map((point) => ({
    ...point,
    VolumeBar: null,
    VolumeBarScaled: null,
  }))

  volumeIndexes.forEach((volumeIndex, index) => {
    const volume = points[volumeIndex]?.VolumeBar ?? null
    if (volume === null) return

    const nextVolumeIndex = volumeIndexes[index + 1] ?? points.length
    const bucketPointCount = Math.max(nextVolumeIndex - volumeIndex, 1)
    const barValue = volume / bucketPointCount

    for (let i = volumeIndex; i < nextVolumeIndex; i++) {
      const point = nextPoints[i]
      if (point) {
        point.VolumeBar = barValue
        point.VolumeBarScaled = barValue * volumeScale
      }
    }
  })

  return nextPoints
}

const generateMultiMetricData = (
  tvlHistory: StatsHistoryPoint[],
  volumeHistory: StatsHistoryPoint[],
  hdxPrices: HdxPricePoint[],
  includeHdxPoints: boolean,
  volumeScale: number,
): ChartMetricData[] => {
  const points = new Map<number, ChartMetricData>()

  const getPoint = (timestamp: number) => {
    const existing = points.get(timestamp)
    if (existing) return existing

    const date = new Date(timestamp)
    const next = {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "2-digit"
            : undefined,
      }),
      timestamp: date.getTime(),
      TVL: null,
      Volume: null,
      VolumeBar: null,
      VolumeBarScaled: null,
      HDX: null,
    }

    points.set(timestamp, next)
    return next
  }

  tvlHistory.forEach(({ timestamp, value }) => {
    getPoint(timestamp).TVL = value / 1_000_000
  })

  volumeHistory.forEach(({ timestamp, value }) => {
    const point = getPoint(timestamp)
    const volume = value / 1_000_000

    point.Volume = volume
    point.VolumeBar = volume
  })

  if (includeHdxPoints) {
    hdxPrices.forEach(({ timestamp, price }) => {
      getPoint(timestamp).HDX = price
    })
  }

  const sortedPoints = Array.from(points.values()).toSorted(
    sortBy({
      select: (point) => point.timestamp,
      compare: numerically,
    }),
  )

  let latestTvl: number | null = null
  let latestVolume: number | null = null

  const filledPoints = sortedPoints.map((point) => {
    latestTvl = point.TVL ?? latestTvl
    latestVolume = point.Volume ?? latestVolume

    return {
      ...point,
      TVL: point.TVL ?? latestTvl,
      Volume: point.Volume ?? latestVolume,
    }
  })

  return distributeVolumeBars(filledPoints, volumeScale)
}

const hasMetricValue = (point: ChartMetricData, metric: MetricKey) =>
  metric === "Volume"
    ? point.Volume !== null || point.VolumeBar !== null
    : point[metric] !== null

type Props = {
  className?: string
}

export const MultiMetricChart: FC<Props> = ({ className }) => {
  const { themeProps: theme } = useTheme()
  const squidUrl = useSquidUrl()
  const { price: liveHdxPrice } = useAssetPrice(NATIVE_ASSET_ID)
  const [timeRange, setTimeRange] = useState<TimeRange>("1Y")
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    new Set(["TVL", "Volume", "HDX"]),
  )
  const {
    data: hdxPrices,
    isLoading: isHdxPricesLoading,
    isError: isHdxPricesError,
  } = useHdxPriceChartData(timeRange)
  const rangeDays = getRangeDays(timeRange)
  const volumeBucket = useMemo(() => getVolumeBucket(timeRange), [timeRange])
  const {
    data: tvlHistory = [],
    isLoading: isTvlHistoryLoading,
    isError: isTvlHistoryError,
  } = useQuery(defillamaHydrationTvlHistoryQuery())
  const {
    data: volumeHistory = [],
    isLoading: isVolumeHistoryLoading,
    isError: isVolumeHistoryError,
  } = useQuery(
    platformDailyVolumeHistoryQuery(squidUrl, rangeDays, volumeBucket),
  )

  const metricsConfig = useMemo<
    Record<
      MetricKey,
      {
        color: string
        label: string
        yAxisId: "metric" | "price"
        formatValue: (value: number | null) => string
      }
    >
  >(() => {
    const colors = getTvlColors(theme)

    return {
      TVL: {
        color: colors.stablePools,
        label: "TVL",
        yAxisId: "metric",
        formatValue: formatMillionUsd,
      },
      Volume: {
        color: colors.xykPools,
        label: "Volume",
        yAxisId: "metric",
        formatValue: formatMillionUsd,
      },
      HDX: {
        color: colors.moneyMarket,
        label: "HDX Price",
        yAxisId: "price",
        formatValue: (value) => (value === null ? "-" : formatPrice(value)),
      },
    }
  }, [theme])

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
  const chartData = useMemo(
    () =>
      generateMultiMetricData(
        tvlHistory,
        volumeHistory,
        hdxPrices,
        selectedMetrics.has("HDX"),
        volumeBarScale,
      ),
    [hdxPrices, selectedMetrics, tvlHistory, volumeBarScale, volumeHistory],
  )

  const filteredData = useMemo(() => {
    if (timeRange === "ALL") return chartData

    const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000
    return chartData.filter((point) => point.timestamp >= cutoff)
  }, [chartData, rangeDays, timeRange])

  const aggregates = useMemo(() => {
    if (filteredData.length === 0) return { TVL: 0, Volume: 0, HDX: null }

    const latestTvl =
      filteredData.findLast((point) => point.TVL !== null)?.TVL ?? 0
    const liveHdxPriceValue =
      liveHdxPrice && isValidBigSource(liveHdxPrice) && Big(liveHdxPrice).gt(0)
        ? Number(liveHdxPrice)
        : null
    const latestHdxPrice =
      liveHdxPriceValue ??
      filteredData.findLast((point) => point.HDX !== null)?.HDX ??
      null

    return {
      TVL: latestTvl,
      Volume: filteredData.reduce(
        (acc, curr) => acc + (curr.VolumeBar ?? 0),
        0,
      ),
      HDX: latestHdxPrice,
    }
  }, [filteredData, liveHdxPrice])

  const activeMetrics = Array.from(selectedMetrics)
  const activeMetricAxisMetrics = activeMetrics.filter(
    (metric) => metricsConfig[metric].yAxisId === "metric",
  )
  const isMetricAxisVolumeOnly =
    activeMetricAxisMetrics.length === 1 &&
    activeMetricAxisMetrics[0] === "Volume"
  const metricAxisColor =
    activeMetricAxisMetrics.length === 1
      ? metricsConfig[activeMetricAxisMetrics[0] as MetricKey].color
      : theme.text.medium
  const volumeBarSize = VOLUME_BAR_SIZE_BY_RANGE[timeRange]
  const isChartLoading =
    isTvlHistoryLoading ||
    isVolumeHistoryLoading ||
    (selectedMetrics.has("HDX") && isHdxPricesLoading)
  const isChartError =
    isTvlHistoryError ||
    isVolumeHistoryError ||
    (selectedMetrics.has("HDX") && isHdxPricesError)
  const isChartEmpty =
    activeMetrics.length === 0 ||
    !filteredData.some((point) =>
      activeMetrics.some((metric) => hasMetricValue(point, metric)),
    )
  const activeMetricLabels = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(metricsConfig).map(([key, config]) => [
          config.label,
          key as MetricKey,
        ]),
      ),
    [metricsConfig],
  )

  return (
    <SChartContainer className={className}>
      <SChartHeader $enableMobile={false} $marginBottom="xl">
        <SMetricButtons>
          {(Object.keys(metricsConfig) as MetricKey[]).map((metric) => {
            const isActive = selectedMetrics.has(metric)

            return (
              <Box
                key={metric}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: getToken("space.s"),
                  cursor: "pointer",
                  "&:hover": {
                    bg: getToken("buttons.primary.low.hover"),
                  },
                }}
                role="button"
                py="xs"
                px="base"
                bg={
                  isActive
                    ? getToken("buttons.primary.low.rest")
                    : "transparent"
                }
                borderRadius="xl"
                onClick={() => toggleMetric(metric)}
              >
                <Box
                  width={8}
                  height={8}
                  borderRadius="m"
                  bg={metricsConfig[metric].color}
                />
                <Text
                  fs="p6"
                  lh={1.4}
                  align="center"
                  color={
                    isActive
                      ? getToken("buttons.primary.low.onButton")
                      : getToken("text.medium")
                  }
                >
                  {metricsConfig[metric].label}
                </Text>
              </Box>
            )
          })}
        </SMetricButtons>
        <SControlsGroup>
          <ChartTimeRange
            selectedOption={timeRange}
            options={["7D", "1M", "3M", "1Y", "ALL"]}
            onSelect={(value) => setTimeRange(value)}
          />
        </SControlsGroup>
      </SChartHeader>

      <SChartSummary>
        {activeMetrics.map((metric, i) => (
          <Fragment key={metric}>
            {i > 0 && (
              <Separator
                key={`sep-${metric}`}
                orientation="vertical"
                sx={{
                  my: getSpacingValue("quart"),
                  flexShrink: 0,
                }}
              />
            )}
            <ValueStats
              key={metric}
              size="small"
              wrap
              customLabel={
                <SMetricLabel>
                  <Box
                    width={8}
                    height={8}
                    borderRadius="m"
                    bg={metricsConfig[metric].color}
                  />
                  {metricsConfig[metric].label}
                </SMetricLabel>
              }
              customValue={
                <ValueStatsValue
                  size="small"
                  style={{ color: metricsConfig[metric].color }}
                >
                  {metricsConfig[metric].formatValue(aggregates[metric])}
                </ValueStatsValue>
              }
            />
          </Fragment>
        ))}
      </SChartSummary>

      <SChartState
        isLoading={isChartLoading}
        isError={isChartError}
        isEmpty={isChartEmpty}
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            barCategoryGap={0}
          >
            <defs>
              {activeMetrics.map((metric) => (
                <linearGradient
                  key={metric}
                  id={`grad-${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={metricsConfig[metric].color}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={metricsConfig[metric].color}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.details.separators}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: theme.text.medium, fontSize: 11 }}
              axisLine={{ stroke: theme.details.separators }}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              yAxisId="metric"
              tick={{ fill: metricAxisColor, fontSize: 11 }}
              axisLine={{ stroke: metricAxisColor }}
              tickLine={false}
              tickFormatter={(v) =>
                formatMillionUsd(
                  isMetricAxisVolumeOnly
                    ? Number(v) / volumeBarScale
                    : Number(v),
                )
              }
              width={55}
            />
            {activeMetrics.includes("HDX") && (
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fill: metricsConfig.HDX.color, fontSize: 11 }}
                axisLine={{ stroke: metricsConfig.HDX.color }}
                tickLine={false}
                tickFormatter={(v) => formatPrice(Number(v))}
                width={70}
              />
            )}

            <Tooltip
              {...chartTooltipProps}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload as TooltipPayloadItem[] | undefined}
                  label={label}
                  valueFormatter={(value, name, entry) => {
                    const metric = activeMetricLabels[name]
                    const point = entry?.payload as ChartMetricData | undefined
                    const realValue =
                      entry?.dataKey === "VolumeBarScaled"
                        ? (point?.VolumeBar ?? value)
                        : value

                    return metric
                      ? metricsConfig[metric].formatValue(realValue)
                      : formatMillionUsd(realValue)
                  }}
                />
              )}
              cursor={{ fill: theme.surfaces.containers.high.hover }}
            />

            {activeMetrics.includes("Volume") && (
              <Bar
                yAxisId={metricsConfig.Volume.yAxisId}
                dataKey="VolumeBarScaled"
                name={metricsConfig.Volume.label}
                fill={metricsConfig.Volume.color}
                fillOpacity={VOLUME_BAR_OPACITY}
                barSize={volumeBarSize}
                radius={[3, 3, 0, 0]}
              />
            )}

            {activeMetrics.includes("Volume") && (
              <Area
                yAxisId={metricsConfig.Volume.yAxisId}
                type="linear"
                dataKey="Volume"
                name={metricsConfig.Volume.label}
                stroke={metricsConfig.Volume.color}
                strokeOpacity={0}
                fillOpacity={0}
                dot={false}
                activeDot={false}
                connectNulls
              />
            )}

            {activeMetrics
              .filter((metric) => metric !== "Volume")
              .map((metric) => (
                <Area
                  key={metric}
                  yAxisId={metricsConfig[metric].yAxisId}
                  type={metric === "HDX" ? "linear" : "monotone"}
                  dataKey={metric}
                  name={metricsConfig[metric].label}
                  stroke={metricsConfig[metric].color}
                  fill={`url(#grad-${metric})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </SChartState>
    </SChartContainer>
  )
}
