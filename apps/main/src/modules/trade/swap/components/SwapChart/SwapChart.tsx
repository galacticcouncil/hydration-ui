import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import React from "react"

import { krakenPairForPlatform } from "@/api/external/kraken"
import { TradeChartNeckwork } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork"
import { XcSwapChart } from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart"
import { XC_SWAP_ASSET_META } from "@/modules/trade/swap/sections/XcSwap/config/meta"
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
        sellAssetId={assetIn}
        sellSymbol={sellAsset.symbol}
        destPlatform={destPlatform}
        destSymbol={destMeta.symbol}
      />
    )
  }

  return <TradeChartNeckwork height={height} />
}
