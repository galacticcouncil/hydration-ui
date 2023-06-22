import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  Bar,
  BarChart,
  BarProps,
  Cell,
  ResponsiveContainer,
  XAxis,
} from "recharts"
import { theme } from "theme"
import { useAssetsVolumeChart } from "./BarChart.utils"

type BarItemProps = Required<NonNullable<BarProps["data"]>[number]> &
  ReturnType<typeof useAssetsVolumeChart>["data"][number]

export const BarChartComp = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [activeBar, setActiveBar] = useState<BarItemProps | undefined>(
    undefined,
  )
  const { data } = useAssetsVolumeChart()

  return (
    <div css={{ position: "relative" }}>
      {activeBar && <Label item={activeBar} />}
      <ResponsiveContainer width="100%" height={isDesktop ? 600 : 400}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="gradient" x1=".5" x2=".5" y2="1">
              <stop offset=".455" stopColor="#85d1ff" stopOpacity=".61" />
              <stop offset=".928" stopColor="#4fc0ff" stopOpacity=".17" />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="hours"
            height={30}
            tick={{ fontSize: 12, fill: "white" }}
          />

          <Bar
            dataKey="dollarValue"
            onMouseLeave={() => setActiveBar(undefined)}
            onMouseOver={(bar) => {
              if (bar.hours !== activeBar?.hours) {
                setActiveBar(bar)
              }
            }}
          >
            {data.map((entry, index) => {
              const isActive = entry.hours === activeBar?.hours
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
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const Label = ({ item }: { item: BarItemProps }) => {
  const { t } = useTranslation()

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
            date: item.date,
          })}
        </Text>
        <Text fs={18} color="basic100">
          {item.hours}
        </Text>
      </div>
      <div
        sx={{ flex: "row", gap: 4, align: "baseline" }}
        css={{
          position: "absolute",
          left: 0,
          top: "-20px",
          zIndex: 1,
        }}
      >
        <Text fs={24}>
          <DisplayValue value={item.displayValue} />
        </Text>
      </div>
    </>
  )
}
