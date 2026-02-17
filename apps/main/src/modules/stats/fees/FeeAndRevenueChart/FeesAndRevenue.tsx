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

export const FeesAndRevenue = () => {
  const { t } = useTranslation(["common", "stats"])
  const { gte } = useBreakpoints()
  const { themeProps: theme, getToken } = useTheme()
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

  const seriesKeys = Array.from(fields.keys())

  const hiddenSeries = (() => {
    if (activeFilter !== "all") {
      const map = new Map(fields)
      map.delete(activeFilter)
      return map
    }
    return new Map()
  })()

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
      </ChartState>
    </Flex>
  )
}
