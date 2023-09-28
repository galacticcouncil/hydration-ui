import { useState } from "react"
import { useTranslation } from "react-i18next"
import { StatsTimeframe } from "api/stats"
import { Charts } from "./Charts"
import {
  SChartTab,
  STimeframeContainer,
  STimeframeEl,
} from "sections/stats/components/ChartsWrapper/ChartsWrapper.styled"
import { Spacer } from "components/Spacer/Spacer"
import { useRpcProvider } from "providers/rpcProvider"

export type ChartType = "pol" | "volume"

type Props = { assetSymbol?: string }

export const ChartsWrapper = ({ assetSymbol }: Props) => {
  const { t } = useTranslation()
  const [chartType, setChartType] = useState<ChartType>("volume")
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
          {/* TODO: Not ready. Requested in #861n9ffe4 */}
          {/*<SChartTab*/}
          {/*  disabled={!isApi || true}*/}
          {/*  aria-label="total value locked"*/}
          {/*  active={chartType === "pol"}*/}
          {/*  onClick={() => setChartType("pol")}*/}
          {/*>*/}
          {/*  {t("stats.pol.chart.switcher.pol")}*/}
          {/*</SChartTab>*/}
          <SChartTab
            disabled={!isLoaded}
            aria-label="24 volume"
            active={chartType === "volume"}
            onClick={() => setChartType("volume")}
          >
            {t("stats.pol.chart.switcher.volume")}
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
      <Charts
        type={chartType}
        timeframe={timeframe}
        assetSymbol={assetSymbol}
      />
    </>
  )
}
