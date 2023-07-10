import { useState } from "react"
import { SChartTab } from "./ChartWrapper.styled"
import { BarChartComp } from "./components/BarChart/BarChart"
import { useApiPromise } from "utils/api"
import { useTranslation } from "react-i18next"

type ChartType = "tvl" | "volume"

export const ChartWrapper = () => {
  const { t } = useTranslation()
  const [chartType, setChartType] = useState<ChartType>("volume")
  const api = useApiPromise()

  return (
    <>
      <div sx={{ flex: "row", gap: 12, justify: ["end", "start"] }}>
        <SChartTab
          aria-label="total value locked"
          active={chartType === "tvl"}
          onClick={() => setChartType("tvl")}
        >
          {t("stats.lrna.chart.switcher.price")}
        </SChartTab>
        <SChartTab
          aria-label="24 volume"
          active={chartType === "volume"}
          onClick={() => setChartType("volume")}
        >
          {t("stats.lrna.chart.switcher.supply")}
        </SChartTab>
      </div>
      {chartType === "volume" && <BarChartComp />}
    </>
  )
}
