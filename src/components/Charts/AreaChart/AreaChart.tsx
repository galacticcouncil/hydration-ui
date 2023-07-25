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
import { ReactComponent as CustomDot } from "assets/icons/ChartDot.svg"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { CategoricalChartState } from "recharts/types/chart/generateCategoricalChart"
import { Text } from "components/Typography/Text/Text"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { AreaChartSkeleton } from "./AreaChartSkeleton"
import { StatsData } from "api/stats"
import { Maybe } from "utils/helpers"

const MIN_TO_SHOW_CHART = 5

type CustomTooltipProps = { active: boolean; label: string }

type AreaChartProps = {
  data: Maybe<Array<StatsData>>
  dataKey: 'tvl_usd' | 'tvl_pol_usd'
  loading: boolean
  error: boolean
}

export const CustomTooltip = ({ active, label }: CustomTooltipProps) => {
  const { t } = useTranslation()

  if (active) {
    const date = new Date(label)

    return (
      <div sx={{ flex: "column", align: "center" }}>
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

export const AreaChart = ({ data, loading, error, dataKey }: AreaChartProps) => {
  const { t } = useTranslation()
  const [activePoint, setActivePoint] = useState<CategoricalChartState | null>(
    null,
  )

  if (loading) return <AreaChartSkeleton state="loading" />

  if (error) return <AreaChartSkeleton state="error" />

  if (!data?.length || data.length < MIN_TO_SHOW_CHART)
    return <AreaChartSkeleton state="noData" />

  return (
    <div css={{ width: "100%", height: "100%", position: "relative" }}>
      {activePoint?.isTooltipActive && (
        <Label value={activePoint.activePayload?.[0].value} />
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
            wrapperStyle={{
              outline: "unset",
            }}
            content={(props) => (
              <CustomTooltip active={!!props.active} label={props.label} />
            )}
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
            tickFormatter={(data) => format(new Date(data), "MMM  dd")}
          />
          <YAxis
            dataKey={dataKey}
            tick={{ fontSize: 12, fill: "white" }}
            orientation="right"
            mirror
            tickFormatter={(data) => t("value.usd", { amount: data })}
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
