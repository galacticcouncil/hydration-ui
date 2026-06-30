import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React, { useState } from "react"

import { krakenPairForPlatform } from "@/api/external/kraken"
import { XC_SWAP_ASSET_META } from "@/config/xcSwap"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import {
  XcSwapChart,
  XcSwapChartType,
} from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart"
import { useAssets } from "@/providers/assetsProvider"

type SwapChartProps = {
  readonly height: number
}

export const SwapChart: React.FC<SwapChartProps> = ({ height }) => {
  const { getAsset } = useAssets()
  const { assetIn, assetOut, destPlatform } = useSearch({
    from: "/trade/_history",
  })
  const [chartType, setChartType] = useState<XcSwapChartType>("line")

  const sellAsset = getAsset(assetIn)
  const destMeta = XC_SWAP_ASSET_META[assetOut]

  const isCrossChain = destPlatform !== HYDRATION_CHAIN_KEY
  const showXcSwapChart =
    isCrossChain &&
    !!krakenPairForPlatform(destPlatform) &&
    !!destMeta &&
    !!sellAsset

  if (showXcSwapChart) {
    return (
      <XcSwapChart
        height={height}
        chartType={chartType}
        setChartType={setChartType}
        sellAssetId={assetIn}
        sellSymbol={sellAsset.symbol}
        destPlatform={destPlatform}
        destSymbol={destMeta.symbol}
      />
    )
  }

  return <TradeChart height={height} />
}
