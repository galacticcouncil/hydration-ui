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
  Flex,
  Paper,
  Select,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useQueries } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { ChartState } from "@/components/ChartState"
import { ChartTimeRange } from "@/components/ChartTimeRange/ChartTimeRange"
import { getTotalValueLabel } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeesLegendNeckwork } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesLegendNeckwork"
import { FeesStackedBar } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesStackedBar"

const VIEW_MODES = [
  "protocol",
  "total",
] as const satisfies readonly FeeViewMode[]

const STREAM_KEYS = FEE_STREAMS.map(({ key }) => key)

const CHART_HEIGHT = 380

export const FeesAndRevenueNeckwork = () => {
  const { t } = useTranslation(["common", "stats"])
  const { gte } = useBreakpoints()
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
  // keepPreviousData` is a no-op the moment the range or mode changes — the
  // old observer is thrown away with its data. Hold the last loaded result
  // here instead, and keep it on screen (faded) until the new one lands.
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

  const selectedStream = activeFilter === "all" ? null : activeFilter
  const visibleStreams = selectedStream ? [selectedStream] : STREAM_KEYS
  const visibleRows = selectedStream
    ? rows.filter(({ stream }) => stream === selectedStream)
    : rows

  const headlineTotal = selectedStream
    ? (totals.byStream[selectedStream] ?? 0)
    : totals.total

  const isBiggerScreen = gte("md")

  return (
    <Flex as={Paper} direction="column" gap="xl" p="xl">
      <Flex justify="space-between" align="center">
        <ValueStats
          customValue={
            <Text fs="h6" fw={700} font="primary" lh={1}>
              <AnimatedValue
                value={headlineTotal}
                format={(value) => t("currency.compact", { value })}
              />
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

      <Box
        height={CHART_HEIGHT}
        sx={{
          opacity: isRefetching ? 0.4 : 1,
          transition: "opacity 150ms ease-in-out",
        }}
      >
        <ChartState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!visibleRows.length}
          variant="bar"
          sx={{ height: "100%" }}
        >
          <FeesStackedBar
            rows={visibleRows}
            streams={visibleStreams}
            height={CHART_HEIGHT}
          />
        </ChartState>
      </Box>

      {isBiggerScreen ? (
        <FeesLegendNeckwork
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
          <FeesLegendNeckwork
            fields={fields}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </Flex>
      )}
    </Flex>
  )
}
