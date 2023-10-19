import { useState } from "react"
import { useTranslation } from "react-i18next"
import { StatsTimeframe } from "api/stats"
import {
  SChartTab,
  STimeframeContainer,
  STimeframeEl,
} from "./ChartsWrapper.styled"
import { Charts } from "./Charts"
import { Spacer } from "components/Spacer/Spacer"
import { useRpcProvider } from "providers/rpcProvider"

export type ChartType = "tvl" | "volume"

type Props = { assetId?: string }

export const ChartWrapper = ({ assetId }: Props) => {
  const { t } = useTranslation()
  const [chartType, setChartType] = useState<ChartType>("tvl")
  const [timeframe, setTimeframe] = useState<StatsTimeframe>(
    StatsTimeframe.HOURLY,
  )
  const { isLoaded } = useRpcProvider()

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
            disabled={!isLoaded}
            aria-label="total value locked"
            active={chartType === "tvl"}
            onClick={() => setChartType("tvl")}
          >
            {t("stats.overview.chart.switcher.tvl")}
          </SChartTab>
          <SChartTab
            disabled={!isLoaded}
            aria-label="24h volume"
            active={chartType === "volume"}
            onClick={() => setChartType("volume")}
          >
            {t("stats.overview.chart.switcher.volume")}
          </SChartTab>
        </div>
        {chartType === "volume" ? (
          <STimeframeContainer>
            <STimeframeEl
              disabled={!isLoaded}
              active={timeframe === StatsTimeframe["DAILY"]}
              onClick={() => setTimeframe(StatsTimeframe["DAILY"])}
            >
              {t("stats.chart.timeframe.month")}
            </STimeframeEl>
            <STimeframeEl
              disabled={!isLoaded}
              active={timeframe === StatsTimeframe["HOURLY"]}
              onClick={() => setTimeframe(StatsTimeframe["HOURLY"])}
            >
              {t("stats.chart.timeframe.day")}
            </STimeframeEl>
          </STimeframeContainer>
        ) : (
          <Spacer size={22} />
        )}
      </div>
      <Charts type={chartType} timeframe={timeframe} assetId={assetId} />
    </>
  )
}
