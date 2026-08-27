import { TradingViewChartRef } from "@galacticcouncil/ui/components"
import { useRef, useState } from "react"

import { ChartTimeRangeDropdown } from "@/components/ChartTimeRange/ChartTimeRangeDropdown"
import i18n from "@/i18n"
import {
  intervalOptions,
  PoolChart,
  PoolChartTimeFrameType,
} from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import {
  isIsolatedPool,
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"

import { PoolDetailsValues } from "./PoolDetailsValues"
import { PoolStatsShell } from "./PoolStatsShell"

export { types } from "./PoolStatsShell"

export const chartTypes: ReadonlyArray<{
  id: "price" | "volume"
  label: string
}> = [
  { id: "price", label: i18n.t("price") },
  //{ id: "volume", label: i18n.t("volume") },
]

export const PoolStats = ({
  data,
}: {
  data: OmnipoolAssetTable | IsolatedPoolTable
}) => {
  const isOmnipool = !isIsolatedPool(data)
  const chartRef = useRef<TradingViewChartRef>(null)
  const [interval, setInterval] = useState<PoolChartTimeFrameType | "all">(
    "week",
  )

  const changeInterval = (interval: PoolChartTimeFrameType | "all"): void => {
    setInterval(interval)
    chartRef.current?.resetZoom()
  }

  return (
    <PoolStatsShell
      values={<PoolDetailsValues data={data} />}
      renderChart={(isMobile) => (
        <PoolChart
          chartRef={chartRef}
          assetId={data.id}
          height={
            isMobile
              ? 350
              : isOmnipool && data.isStablepoolInOmnipool
                ? 500
                : 420
          }
          interval={interval}
          setInterval={changeInterval}
          isEmptyData={!isOmnipool}
        />
      )}
      renderChartHeader={(isMobile) =>
        isMobile && (
          <ChartTimeRangeDropdown
            options={intervalOptions}
            selectedOption={interval}
            onSelect={changeInterval}
          />
        )
      }
    />
  )
}
