import {
  XAxis,
  AreaChart as AreaRecharts,
  Area,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { theme } from "theme"
import { format, startOfHour } from "date-fns"
import { ReactComponent as CustomDot } from "assets/icons/ChartDot.svg"
import { useTranslation } from "react-i18next"
import { useState, useMemo } from "react"
import { CategoricalChartState } from "recharts/types/chart/generateCategoricalChart"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { AreaChartSkeleton } from "./AreaChartSkeleton"
import { StatsData, StatsTimeframe } from "api/stats"
import { Maybe } from "utils/helpers"

const MIN_TO_SHOW_CHART = 5

type CustomTooltipProps = { active: boolean; label: string; x: number }

type AreaChartProps = {
  data: Maybe<Array<StatsData>>
  dataKey: "tvl_usd" | "tvl_pol_usd"
  loading: boolean
  error: boolean
  timeframe: StatsTimeframe
}

export const CustomTooltip = ({ active, label, x }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (active) {
    const date = new Date(label)

    return (
      <div
        sx={{ flex: "column", align: "center" }}
        css={{ position: "absolute", top: 15, left: x - 40 }}
      >
        <Text
          fs={12}
          css={{
            color: `rgba(${theme.rgbColors.white}, 0.4)`,
            whiteSpace: "nowrap",
          }}
        >
          {t("stats.overview.chart.tvl.label.date", {
            date,
          })}
        </Text>
        <Text fs={18} color="basic100">
          {t("stats.overview.chart.tvl.label.time", {
            date,
          })}
        </Text>
      </div>
    )
  }

  return null
}

const CustomizedDot = ({ cx, cy }: { cx: number; cy: number }) => (
  <CustomDot x={cx - 17.5} y={cy - 17.5} />
)

const Label = ({ value }: { value: number }) => {
  return (
    <div
      sx={{ flex: "row", gap: 4, align: "baseline", top: [-100, -50] }}
      css={{
        position: "absolute",
        left: 0,
        zIndex: 1,
      }}
    >
      <Text fs={24}>
        <DisplayValue value={value} isUSD />
      </Text>
    </div>
  )
}

const filterTickes = (
  data: Array<StatsData>,
  timeframe: StatsTimeframe.DAILY | StatsTimeframe.WEEKLY,
) => {
  const ticks = data.reduce((acc, item) => {
    if (
      timeframe === StatsTimeframe.WEEKLY &&
      !acc.find(
        (tick) =>
          new Date(tick).getDate() === new Date(item.interval).getDate(),
      )
    ) {
      acc.push(item.interval)
      return acc
    }

    const currentLabelHour = startOfHour(new Date(item.interval))

    if (
      timeframe === StatsTimeframe.DAILY &&
      !acc.find(
        (tick) => new Date(tick).getHours() === currentLabelHour.getHours(),
      )
    ) {
      acc.push(currentLabelHour.toISOString())
      return acc
    }

    return acc
  }, [] as string[])

  return ticks
}

export const AreaChart = ({
  data,
  loading,
  error,
  dataKey,
  timeframe,
}: AreaChartProps) => {
  const { t } = useTranslation()
  const [activePoint, setActivePoint] = useState<CategoricalChartState | null>(
    null,
  )

  const ticks = useMemo(() => {
    if (data && timeframe !== StatsTimeframe.ALL) {
      const ticks = filterTickes(data, timeframe)
      return ticks
    }
    return []
  }, [timeframe, data])

  if (loading) return <AreaChartSkeleton state="loading" />

  if (error) return <AreaChartSkeleton state="error" />

  if (!data?.length || data.length < MIN_TO_SHOW_CHART)
    return <AreaChartSkeleton state="noData" />

  return (
    <div
      css={{
        width: "100%",
        height: "100%",
        position: "relative",
        ".yAxis .recharts-cartesian-axis-tick:first-of-type": {
          display: "none",
        },
      }}
    >
      {activePoint &&
        activePoint?.activeLabel &&
        activePoint.activeCoordinate?.x && (
          <>
            <Label value={activePoint.activePayload?.[0].value} />
            <CustomTooltip
              label={activePoint.activeLabel}
              active
              x={activePoint.activeCoordinate?.x}
            />
          </>
        )}
      <ResponsiveContainer>
        <AreaRecharts
          data={data}
          onMouseLeave={() => setActivePoint(null)}
          onMouseMove={(data) => {
            if (data.activeTooltipIndex !== activePoint?.activeTooltipIndex)
              setActivePoint(data)
          }}
        >
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#85D1FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={() => null}
            cursor={{
              stroke: "#66697C",
              strokeWidth: 1,
              strokeDasharray: "2 6",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#85D1FF"
            fill="url(#color)"
            activeDot={(props) => <CustomizedDot {...props} />}
          />
          <XAxis
            dataKey="interval"
            tick={{ fontSize: 12, fill: "white" }}
            tickFormatter={(data) => {
              const date = new Date(data)
              return format(
                date,
                timeframe === StatsTimeframe.DAILY && date.getHours() !== 0
                  ? "HH:mm"
                  : "MMM  dd",
              )
            }}
            ticks={timeframe !== StatsTimeframe.ALL ? ticks : []}
          />
          <YAxis
            dataKey={dataKey}
            tick={{ fontSize: 12, fill: "white" }}
            orientation="right"
            mirror
            tickFormatter={(data) => t("value.usd", { amount: data })}
            domain={[0, (dataMax: number) => Math.round(dataMax * 1.2)]}
          />
          <ReferenceLine
            y={activePoint?.activePayload?.[0].value}
            stroke="#66697C"
            strokeDasharray="2 4"
          />
        </AreaRecharts>
      </ResponsiveContainer>
    </div>
  )
}
