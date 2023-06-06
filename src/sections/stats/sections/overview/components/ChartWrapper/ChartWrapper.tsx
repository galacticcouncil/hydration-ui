import { useState } from "react"
import { SChartTab } from "./ChartWrapper.styled"
import { BarChartComp } from "./components/BarChart/BarChart"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"

type ChartType = "tvl" | "volume"

export const ChartWrapper = () => {
  const [chartType, setChartType] = useState<ChartType>("volume")
  const api = useApiPromise()
  const isApi = isApiLoaded(api)

  if (!isApi) return null

  return (
    <>
      <div sx={{ flex: "row", gap: 12 }}>
        <SChartTab
          aria-label="total value locked"
          active={chartType === "tvl"}
          onClick={() => setChartType("tvl")}
        >
          tvl
        </SChartTab>
        <SChartTab
          aria-label="24 volume"
          active={chartType === "volume"}
          onClick={() => setChartType("volume")}
        >
          volume
        </SChartTab>
      </div>
      {chartType === "volume" && <BarChartComp />}
    </>
  )
}
