import { TradingViewChartRef } from "@galacticcouncil/ui/components"
import { useRef, useState } from "react"

import {
  PoolChart,
  PoolChartTimeFrameType,
} from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import { VaultTable } from "@/modules/liquidity/Vaults.utils"

/** token0 against the display stablecoin, same feed as an omnipool asset page */
export const VaultPriceChart = ({ vault }: { vault: VaultTable }) => {
  const chartRef = useRef<TradingViewChartRef>(null)
  const [interval, setInterval] = useState<PoolChartTimeFrameType | "all">(
    "week",
  )
  const [token0] = vault.tokens

  return (
    <PoolChart
      chartRef={chartRef}
      assetId={token0.id}
      height={420}
      interval={interval}
      setInterval={(next) => {
        setInterval(next)
        chartRef.current?.resetZoom()
      }}
    />
  )
}
