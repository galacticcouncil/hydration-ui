import { useState } from "react"
import { SChartTab } from "./ChartWrapper.styled"
import { useTranslation } from "react-i18next"

type ChartType = "price" | "supply"

export const ChartWrapper = () => {
  const { t } = useTranslation()
  const [chartType, setChartType] = useState<ChartType>("price")

  return (
    <>
      <div sx={{ flex: "row", gap: 12, justify: ["end", "start"] }}>
        <SChartTab
          aria-label="Price"
          active={chartType === "price"}
          onClick={() => setChartType("price")}
        >
          {t("stats.lrna.chart.switcher.price")}
        </SChartTab>
        <SChartTab
          aria-label="Supply"
          active={chartType === "supply"}
          onClick={() => setChartType("supply")}
        >
          {t("stats.lrna.chart.switcher.supply")}
        </SChartTab>
      </div>
    </>
  )
}
