import {
  FEE_STREAMS,
  feesChartQuery,
  FeesChartResult,
  feesChartWindow,
  FeeStreamKey,
  FeeViewMode,
  foldFeesChart,
  TIME_RANGES,
  TimeRange,
} from "@galacticcouncil/indexer/neckwork"
import {
  AnimatedValue,
  Box,
  Chart,
  chartColorScale,
  ChartTimeRange,
  Flex,
  Paper,
  Select,
  Skeleton,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints, useTheme } from "@galacticcouncil/ui/theme"
import { barY, defineChart, stack } from "@tanstack/charts"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { fold } from "@tanstack/charts/transform/fold"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import { getTotalValueLabel } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeesLegend } from "@/modules/stats/fees/FeeAndRevenueChart/FeesLegend"
import { FeesStackedBar } from "@/modules/stats/fees/FeeAndRevenueChart/FeesStackedBar"

const VIEW_MODES = [
  "protocol",
  "total",
] as const satisfies readonly FeeViewMode[]

const STREAM_KEYS = FEE_STREAMS.map(({ key }) => key)

const CHART_HEIGHT = 380

export type FeeSegmentRow = {
  timestamp: string
  stream: string
  value: number
}

const BAR_RADIUS = 4
const CHART_HEIGHT = 380

export const FeesAndRevenue = () => {
  const { t } = useTranslation(["common", "stats"])
  const { gte } = useBreakpoints()
  const { getToken } = useTheme()
  const [timeRange, setTimeRange] = useState<TimeRange>("1M")
  const [viewMode, setViewMode] = useState<FeeViewMode>("protocol")
  const [activeFilter, setActiveFilter] = useState<FeeStreamKey | "all">("all")

  const chartWindow = feesChartWindow(timeRange, Date.now())

  const result = useQueries({
    queries: FEE_STREAMS.map((stream) =>
      feesChartQuery(neckworkClient, {
        productType: stream.productType,
        streamType: stream.streamType,
        feeDestination: stream.feeDestination(viewMode),
        ...chartWindow,
      }),
    ),
    combine: (results) => {
      const byStream: Partial<Record<FeeStreamKey, FeesChartResult>> = {}
      const failedStreams = new Set<FeeStreamKey>()

      results.forEach(({ data, isError }, index) => {
        const key = FEE_STREAMS[index]?.key
        if (!key) return
        if (data) byStream[key] = data
        if (isError) failedStreams.add(key)
      })

      return {
        ...foldFeesChart(byStream, STREAM_KEYS),
        failedStreams,
        isPending: results.some(({ isPending }) => isPending),
        isError: results.every(({ isError }) => isError),
      }
    },
  })

  // useQueries matches observers by queryHash, so `placeholderData:
  // keepPreviousData` does nothing the moment the range or mode changes.
  // React Query drops the old observer along with its data. Hold the last
  // loaded result here instead and keep it on screen (faded) until the new
  // one lands.
  const lastLoadedRef = useRef<typeof result | null>(null)
  if (!result.isPending) lastLoadedRef.current = result

  const previous = result.isPending ? lastLoadedRef.current : null
  const { rows, totals, failedStreams, isError } = previous ?? result

  const isLoading = result.isPending && !previous
  const isRefetching = result.isPending && !!previous

  // null marks a failed stream so the legend can tell it apart from a dormant one
  const fields = new Map(
    STREAM_KEYS.map((key) => [
      key,
      failedStreams.has(key) ? null : (totals.byStream[key] ?? 0),
    ]),
  )

  const visibleKeys = useMemo(() => {
    const keys = Object.keys(feesChartsData ?? {})
    return activeFilter === "all"
      ? keys
      : keys.filter((key) => key === activeFilter)
  }, [feesChartsData, activeFilter])

  const rows = useMemo(
    () =>
      fold(chartData, {
        fields: visibleKeys as [string],
        as: { key: "stream", value: "value" },
      })
        .filter(({ value }) => typeof value === "number")
        .map<FeeSegmentRow>(({ timestamp, stream, value }) => ({
          timestamp: String(timestamp),
          stream,
          value: Number(value),
        })),
    [chartData, visibleKeys],
  )

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          barY(rows, {
            x: "timestamp",
            y: "value",
            color: "stream",
            layout: stack({ order: visibleKeys }),
            radius: BAR_RADIUS,
          }),
        ],
        x: {
          scale: () => scaleBand<string>().padding(0.3),
          grid: true,
          axis: {
            line: true,
            ticks: {
              size: 0,
              padding: 8,
              format: formatXAxisTick,
            },
          },
        },
        y: {
          scale: scaleLinear,
          grid: true,
          axis: {
            line: true,
            ticks: {
              size: 0,
              padding: 8,
              format: (value) => t("number.compact", { value }),
            },
          },
        },
        color: chartColorScale(
          Object.fromEntries(
            visibleKeys.map((key) => [
              key,
              feesAndRevenueConfig[key]?.color ?? "accents.info.accent",
            ]),
          ),
          getToken,
        ),
        focus: "group-x",
        tooltip: {
          use: tooltip,
          sort: "color-domain",
          anchor: { x: "value", y: "plot-top" },
          placement: "top",
        },
      }),
    [rows, visibleKeys, getToken, t],
  )

  const totalRevenue =
    activeFilter === "all"
      ? Array.from(fields.values()).reduce((acc, value = 0) => acc + value, 0)
      : (fields.get(activeFilter) ?? 0)

  const isBiggerScreen = gte("md")

  return (
    <Flex as={Paper} direction="column" gap="xl" p="xl">
      <Flex justify="space-between" align="center">
        <ValueStats
          customValue={
            <Text fs="h6" fw={700} font="primary" lh={1} position="relative">
              {isLoading && (
                <Skeleton
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "3xl",
                    height: "100%",
                  }}
                />
              )}
              <Box
                as="span"
                sx={{ visibility: isLoading ? "hidden" : "visible" }}
              >
                <AnimatedValue
                  value={isLoading ? 0 : headlineTotal}
                  format={(value) => t("currency.compact", { value })}
                />
              </Box>
            </Text>
          }
          bottomLabel={getTotalValueLabel(timeRange)}
        />

        <Flex gap={16}>
          {isBiggerScreen && (
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) =>
                value && setViewMode(value as FeeViewMode)
              }
            >
              {VIEW_MODES.map((mode) => (
                <ToggleGroupItem key={mode} value={mode}>
                  {t(`stats:fees.chart.mode.${mode}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          <ChartTimeRange
            selectedOption={timeRange}
            options={TIME_RANGES}
            onSelect={(value) => setTimeRange(value)}
          />
        </Flex>
      </Flex>

        <Box position="relative" flex={1}>
          <Chart
            definition={definition}
            ariaLabel={t("stats:fees.chart.ariaLabel")}
            height={CHART_HEIGHT}
            renderTooltipBody={({ points }) => (
              <CustomTooltipContent points={points} />
            )}
          />
        </ChartState>
      </Box>

      {isBiggerScreen ? (
        <FeesLegend
          fields={fields}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      ) : (
        <Flex gap="base" justify="space-between">
          <Select
            value={viewMode}
            items={VIEW_MODES.map((mode) => ({
              key: mode,
              label: t(`stats:fees.chart.mode.${mode}`),
            }))}
            onValueChange={setViewMode}
          />
          <FeesLegend
            fields={fields}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </Flex>
      )}
    </Flex>
  )
}
