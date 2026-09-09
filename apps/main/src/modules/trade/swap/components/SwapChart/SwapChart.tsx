import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React from "react"

import { krakenPairForPlatform } from "@/api/external/kraken"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { XcSwapChart } from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart"
import { useXcDestinationAsset } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcDestinationAsset"
import { useAssets } from "@/providers/assetsProvider"

type SwapChartProps = {
  readonly height: number
}

export const SwapChart: React.FC<SwapChartProps> = ({ height }) => {
  const { getAsset } = useAssets()
  const { assetIn, assetOut, destPlatform } = useSearch({
    from: "/trade/_history",
  })

  const sellAsset = getAsset(assetIn)
  const destAsset = useXcDestinationAsset(assetOut)

  const isCrossChain = destPlatform !== HYDRATION_CHAIN_KEY
  const showXcSwapChart =
    isCrossChain &&
    !!krakenPairForPlatform(destPlatform) &&
    !!destAsset &&
    !!sellAsset

  if (showXcSwapChart) {
    return (
      <XcSwapChart
        height={height}
        sellAssetId={assetIn}
        sellSymbol={sellAsset.symbol}
        destPlatform={destPlatform}
        destSymbol={destAsset.symbol}
      />
    )
  }

  return <TradeChart height={height} />
}
