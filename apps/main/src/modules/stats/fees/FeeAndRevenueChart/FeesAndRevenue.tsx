import {
  AnimatedValue,
  Box,
  Chart,
  chartColorScale,
  ChartTimeRange,
  Flex,
  Paper,
  Select,
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

import {
  TIME_RANGES,
  TimeRange,
  useFeesChartsData,
  VIEW_MODES,
  ViewMode,
} from "@/api/stats"
import { ChartState } from "@/components/ChartState"
import { CustomTooltipContent } from "@/modules/stats/fees/FeeAndRevenueChart/CustomTooltipContent"
import {
  feesAndRevenueConfig,
  formatXAxisTick,
  getTotalValueLabel,
} from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeeAndRevenueLegend } from "@/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenueLegend"

type ChartDataPoint = {
  timestamp: string
  [key: string]: string | number
}

/** Long-format row: one per (bucket, series) pair, as the stacked mark wants. */
export type FeeSegmentRow = {
  timestamp: string
  stream: string
  value: number
}

const BAR_RADIUS = 4
/** The panel height is fixed, so the chart takes a number rather than measuring. */
const CHART_HEIGHT = 380

export const FeesAndRevenue = () => {
  const { t } = useTranslation(["common", "stats"])
  const { gte } = useBreakpoints()
  const { getToken } = useTheme()
  const [timeRange, setTimeRange] = useState<TimeRange>("1M")
  const [viewMode, setViewMode] = useState<ViewMode>("protocol")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const {
    data: feesChartsData,
    isLoading,
    isError,
  } = useFeesChartsData({
    viewMode,
    timeRange,
  })

  const chartData = useMemo(() => {
    if (!feesChartsData) return []

    return Array.from(
      Object.entries(feesChartsData)
        .reduce((acc, [key, { data }]) => {
          data.forEach(({ timestamp, value }) => {
            const data = acc.get(timestamp)
            if (data) {
              acc.set(timestamp, {
                ...data,
                [key]: value,
              })
            } else {
              acc.set(timestamp, {
                [key]: value,
                timestamp,
              })
            }
          })

          return acc
        }, new Map<string, ChartDataPoint>())
        .values(),
    )
  }, [feesChartsData])

  const fields = new Map(
    Object.entries(feesChartsData ?? {}).map(([key, value]) => [
      key,
      value.periodAggregate,
    ]),
  )

  // filtering happens on the data, not the chart definition: the rows, the
  // colour domain and the stack order all narrow together
  const visibleKeys = useMemo(() => {
    const keys = Object.keys(feesChartsData ?? {})
    return activeFilter === "all"
      ? keys
      : keys.filter((key) => key === activeFilter)
  }, [feesChartsData, activeFilter])

  const rows = useMemo(
    () =>
      // fold's `fields` is typed as a literal tuple; the series keys are only
      // known at runtime, so the arity is narrowed here and never relied on
      fold(chartData, {
        fields: visibleKeys as [string],
        as: { key: "stream", value: "value" },
      })
        // a bucket may be missing a series entirely
        .filter(({ value }) => typeof value === "number")
        .map<FeeSegmentRow>(({ timestamp, stream, value }) => ({
          // the index signature widens the folded key back to string | number
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
    <Flex as={Paper} direction="column" gap="xl" height={600} p="xl">
      <ChartState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!chartData.length}
        sx={{ height: "100%" }}
      >
        <Flex justify="space-between" align="center">
          <ValueStats
            customValue={
              <Text fs="h6" fw={700} font="primary" lh={1}>
                <AnimatedValue
                  value={totalRevenue}
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
                onValueChange={(value) => value && setViewMode(value)}
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
        </Box>

        {isBiggerScreen ? (
          <FeeAndRevenueLegend
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
            <FeeAndRevenueLegend
              fields={fields}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </Flex>
        )}
      </ChartState>
    </Flex>
  )
}
