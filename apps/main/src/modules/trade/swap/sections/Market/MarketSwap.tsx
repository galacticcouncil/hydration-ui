import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { XcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwap"
import { XcSwapProvider } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const MarketSwap: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  return (
    <XcSwapProvider assetIn={assetIn} assetOut={assetOut}>
      <XcSwap />
    </XcSwapProvider>
  )
}
