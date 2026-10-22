import { Box, Paper } from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React from "react"

import { krakenPairForPlatform } from "@/api/external/kraken"
import { ChartState } from "@/components/ChartState"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { XcSwapChart } from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart"
import { useXcDestinationAsset } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcDestinationAsset"
import { useXcSwapClient } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapClient"
import { useXcSwapDestinationAssetsQuery } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapDestinationAssetsQuery"
import { useAssets } from "@/providers/assetsProvider"

type SwapChartProps = {
  readonly height: number
}

const CrossChainChartShell: React.FC<{
  readonly height: number
  readonly isLoading?: boolean
  readonly isEmpty?: boolean
}> = ({ height, isLoading, isEmpty = false }) => (
  <Paper p="xl">
    <Box sx={{ height }}>
      <ChartState sx={{ height }} isLoading={isLoading} isEmpty={isEmpty} />
    </Box>
  </Paper>
)

export const SwapChart: React.FC<SwapChartProps> = ({ height }) => {
  const { getAsset } = useAssets()
  const { assetIn, assetOut, destPlatform } = useSearch({
    from: "/trade/_history",
  })

  const { xcSwap } = useXcSwapClient()
  const { isLoading: isDestAssetsLoading } =
    useXcSwapDestinationAssetsQuery(xcSwap)

  const sellAsset = getAsset(assetIn)
  const destAsset = useXcDestinationAsset(assetOut)

  const isCrossChain = destPlatform !== HYDRATION_CHAIN_KEY
  const hasKrakenChart = !!krakenPairForPlatform(destPlatform)

  if (isCrossChain && hasKrakenChart) {
    if (!sellAsset || isDestAssetsLoading) {
      return <CrossChainChartShell height={height} isLoading />
    }

    if (!destAsset) {
      return <CrossChainChartShell height={height} isEmpty />
    }

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
