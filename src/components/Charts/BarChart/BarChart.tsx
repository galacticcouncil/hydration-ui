import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Bar,
  BarChart as BarRecharts,
  BarProps,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { theme } from "theme"
import { StatsData, StatsTimeframe } from "api/stats"
import { format } from "date-fns"
import { BarChartSkeleton } from "./BarChartSkeleton"
import { Maybe } from "utils/helpers"

const MIN_TO_SHOW_CHART = 5

type BarChartProps = {
  data: Maybe<Array<StatsData>>
  error: boolean
  loading: boolean
  timeframe: StatsTimeframe
}

type BarItemProps = Required<NonNullable<BarProps["data"]>[number]> & StatsData

export const BarChart = ({
  data,
  loading,
  error,
  timeframe,
}: BarChartProps) => {
  const { t } = useTranslation()
  const [activeBar, setActiveBar] = useState<BarItemProps | undefined>(
    undefined,
  )

  if (loading) return <BarChartSkeleton state="loading" />

  if (error) return <BarChartSkeleton state="error" />

  if (!data?.length || data.length < MIN_TO_SHOW_CHART)
    return <BarChartSkeleton state="noData" />

  return (
    <div
      css={{
        position: "relative",
        height: "100%",
        ".yAxis .recharts-cartesian-axis-tick:first-of-type": {
          display: "none",
        },
      }}
    >
      {activeBar && <Label item={activeBar} />}
      <ResponsiveContainer width="100%" height="100%">
        <BarRecharts data={data}>
          <defs>
            <linearGradient id="gradient" x1=".5" x2=".5" y2="1">
              <stop offset=".455" stopColor="#85d1ff" stopOpacity=".61" />
              <stop offset=".928" stopColor="#4fc0ff" stopOpacity=".17" />
            </linearGradient>
          </defs>

          <Bar
            dataKey="volume_usd"
            onMouseLeave={() => setActiveBar(undefined)}
            onMouseOver={(bar) => {
              if (bar.timestamp !== activeBar?.timestamp) {
                setActiveBar(bar)
              }
            }}
          >
            {data.map((entry, index) => {
              const isActive = entry.timestamp === activeBar?.timestamp
              return (
                <Cell
                  cursor="pointer"
                  key={`cell-${index}`}
                  fill={
                    isActive ? theme.colors.brightBlue100 : "url(#gradient)"
                  }
                />
              )
            })}
          </Bar>

          <XAxis
            dataKey="timestamp"
            height={30}
            tick={{ fontSize: 12, fill: "white" }}
            tickFormatter={(data) =>
              format(
                new Date(data),
                timeframe === StatsTimeframe.DAILY ? "MMM  dd" : "HH:mm",
              )
            }
          />

          <YAxis
            dataKey="volume_usd"
            tick={{ fontSize: 12, fill: "white" }}
            orientation="right"
            mirror
            tickFormatter={(data) => t("value.usd", { amount: data })}
            domain={[0, (dataMax: number) => Math.round(dataMax * 1.2)]}
          />
        </BarRecharts>
      </ResponsiveContainer>
    </div>
  )
}

const Label = ({ item }: { item: BarItemProps }) => {
  const { t } = useTranslation()

  const date = new Date(item.timestamp)

  return (
    <>
      <div
        sx={{ flex: "column", align: "center" }}
        css={{
          position: "absolute",
          left: item.x + item.width / 2,
          top: item.y - 40,
          zIndex: 1,
          transform: "translateX(-50%)",
        }}
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
      <div
        sx={{ flex: "row", gap: 4, align: "baseline", top: [-100, -50] }}
        css={{
          position: "absolute",
          left: 0,
          zIndex: 1,
        }}
      >
        <Text fs={24}>
          <DisplayValue value={item.volume_usd} isUSD />
        </Text>
      </div>
    </>
  )
}
