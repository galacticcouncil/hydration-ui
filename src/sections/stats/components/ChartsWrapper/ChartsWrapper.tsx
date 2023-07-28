import { useState } from "react"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useTranslation } from "react-i18next"
import { StatsTimeframe } from "api/stats"
import {
  SChartTab,
  STimeframeContainer,
  STimeframeEl,
} from "./ChartsWrapper.styled"
import { Charts } from "./Charts"

export type ChartType = "tvl" | "volume"

type Props = { assetSymbol?: string }

export const ChartWrapper = ({ assetSymbol }: Props) => {
  const { t } = useTranslation()
  const [chartType, setChartType] = useState<ChartType>("tvl")
  const [timeframe, setTimeframe] = useState<StatsTimeframe>(
    StatsTimeframe["ALL"],
  )
  const api = useApiPromise()
  const isApi = isApiLoaded(api)

  return (
    <>
      <div
        sx={{
          flex: ["row-reverse", "column"],
          justify: "space-between",
          gap: 20,
        }}
      >
        <div sx={{ flex: "row", gap: [4, 12], justify: ["end", "start"] }}>
          <SChartTab
            disabled={!isApi}
            aria-label="total value locked"
            active={chartType === "tvl"}
            onClick={() => setChartType("tvl")}
          >
            {t("stats.overview.chart.switcher.tvl")}
          </SChartTab>
          <SChartTab
            disabled={!isApi}
            aria-label="24 volume"
            active={chartType === "volume"}
            onClick={() => setChartType("volume")}
          >
            {t("stats.overview.chart.switcher.volume")}
          </SChartTab>
        </div>
        <STimeframeContainer>
          <STimeframeEl
            disabled={!isApi}
            active={timeframe === StatsTimeframe["ALL"]}
            onClick={() => setTimeframe(StatsTimeframe["ALL"])}
          >
            {t("stats.chart.timeframe.all")}
          </STimeframeEl>
          <STimeframeEl
            disabled={!isApi}
            active={timeframe === StatsTimeframe["WEEKLY"]}
            onClick={() => setTimeframe(StatsTimeframe["WEEKLY"])}
          >
            {t("stats.chart.timeframe.week")}
          </STimeframeEl>
          <STimeframeEl
            disabled={!isApi}
            active={timeframe === StatsTimeframe["DAILY"]}
            onClick={() => setTimeframe(StatsTimeframe["DAILY"])}
          >
            {t("stats.chart.timeframe.day")}
          </STimeframeEl>
        </STimeframeContainer>
      </div>
      <Charts
        type={chartType}
        timeframe={timeframe}
        assetSymbol={assetSymbol}
      />
    </>
  )
}
