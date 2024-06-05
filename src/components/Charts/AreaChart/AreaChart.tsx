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
import { format } from "date-fns"
import CustomDot from "assets/icons/ChartDot.svg?react"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
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

export const AreaChart = ({
  data,
  loading,
  error,
  dataKey,
}: AreaChartProps) => {
  const { t } = useTranslation()

  const latestValue = useMemo(() => {
    return data?.[data.length - 1]?.[dataKey]
  }, [data, dataKey])

  const [activePoint, setActivePoint] = useState<CategoricalChartState | null>(
    null,
  )

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
      {activePoint ? (
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
        )
      ) : latestValue ? (
        <Label value={latestValue} />
      ) : null}
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
              <stop offset="5%" stopColor="#4FDFFF" stopOpacity={0.3} />
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
            strokeWidth={2}
            fill="url(#color)"
            activeDot={(props) => <CustomizedDot {...props} />}
          />
          <XAxis
            dataKey="timestamp"
            strokeWidth={1}
            shapeRendering="crispEdges"
            stroke={theme.colors.darkBlue400}
            tickLine={false}
            tick={{ fontSize: 12, fill: "white" }}
            tickFormatter={(data) => {
              const date = new Date(data)
              return format(date, "MMM  dd")
            }}
          />
          <YAxis
            dataKey={dataKey}
            tick={{ fontSize: 12, fill: "white" }}
            orientation="right"
            mirror
            shapeRendering="crispEdges"
            stroke={theme.colors.darkBlue400}
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
