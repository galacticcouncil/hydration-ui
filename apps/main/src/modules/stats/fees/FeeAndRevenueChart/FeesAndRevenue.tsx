import {
  AnimatedValue,
  Box,
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
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  TIME_RANGES,
  TimeRange,
  useFeesChartsData,
  VIEW_MODES,
  ViewMode,
} from "@/api/stats"
import { CustomTooltipContent } from "@/modules/stats/fees/FeeAndRevenueChart/CustomTooltipContent"
import {
  feesAndRevenueConfig,
  formatXAxisTick,
  getTotalValueLabel,
} from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeeAndRevenueLegend } from "@/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenueLegend"

export const FeesAndRevenue = () => {
  const { t } = useTranslation(["common", "stats"])
  const { gte } = useBreakpoints()
  const { themeProps: theme, getToken } = useTheme()
  const [timeRange, setTimeRange] = useState<TimeRange>("1M")
  const [viewMode, setViewMode] = useState<ViewMode>("protocol")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const { data: feesChartsData } = useFeesChartsData({ viewMode, timeRange })

  const chartData = useMemo(() => {
    if (!feesChartsData) return []
    const keys = Object.keys(feesChartsData) as (keyof typeof feesChartsData)[]
    const timestampSet = new Set<string>()
    keys.forEach((key) => {
      feesChartsData[key].data.forEach((d) => timestampSet.add(d.timestamp))
    })

    const timestamps = Array.from(timestampSet).sort()
    const byTs = (key: keyof typeof feesChartsData) => {
      const map = new Map(
        feesChartsData[key].data.map((d) => [d.timestamp, d.value]),
      )
      return (ts: string) => map.get(ts) ?? 0
    }
    return timestamps.map((timestamp) => {
      const point: Record<string, number | string> = { timestamp }
      keys.forEach((key) => {
        point[key] = byTs(key)(timestamp)
      })
      return point
    })
  }, [feesChartsData])

  const fields = useMemo(() => {
    return new Map(
      Object.entries(feesChartsData ?? {}).map(([key, value]) => [
        key,
        value.periodAggregate,
      ]),
    )
  }, [feesChartsData])

  const seriesKeys = Array.from(fields.keys())

  const hiddenSeries = useMemo(() => {
    if (activeFilter !== "all") {
      const map = new Map(fields)
      map.delete(activeFilter)
      return map
    }
    return new Map()
  }, [activeFilter, fields])

  const totalRevenue = useMemo(
    () =>
      activeFilter === "all"
        ? Array.from(fields.values()).reduce((acc, value = 0) => acc + value, 0)
        : (fields.get(activeFilter) ?? 0),
    [fields, activeFilter],
  )

  const isBiggerScreen = gte("md")

  return (
    <Flex as={Paper} direction="column" gap="xl" height={600} p="xl">
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
              onValueChange={setViewMode}
            >
              {VIEW_MODES.map((mode) => (
                <ToggleGroupItem key={mode} value={mode}>
                  {t(`stats:fees.chart.mode.${mode}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          <ChartTimeRange
            value={timeRange}
            items={TIME_RANGES}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          />
        </Flex>
      </Flex>

      <Box position="relative" flex={1}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.details.separators}
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: theme.text.low, fontSize: 11 }}
              axisLine={{ stroke: theme.details.separators }}
              tickFormatter={formatXAxisTick}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: theme.text.low, fontSize: 11 }}
              axisLine={{ stroke: theme.details.separators }}
              tickFormatter={(value) => t("number.compact", { value })}
              tickLine={false}
              width={45}
            />
            <Tooltip
              content={CustomTooltipContent}
              cursor={{ fill: theme.surfaces.containers.high.hover }}
            />
            {seriesKeys.map((key, index) => {
              const fieldConfig = feesAndRevenueConfig[key]

              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  name={key}
                  hide={hiddenSeries.has(key)}
                  radius={
                    index === seriesKeys.length - 1 ? [4, 4, 0, 0] : undefined
                  }
                  fill={
                    fieldConfig
                      ? getToken(fieldConfig.color)
                      : getToken("accents.info.accent")
                  }
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
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
    </Flex>
  )
}
