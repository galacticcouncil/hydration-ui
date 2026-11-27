import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { XcTwapForm } from "@/modules/trade/swap/sections/XcTwap/XcTwapForm"
import { XcTwapProvider } from "@/modules/trade/swap/sections/XcTwap/XcTwapProvider"

export const XcTwap: FC = () => {
  const { assetIn, assetOut, destPlatform } = useSearch({
    from: "/trade/_history",
  })

  return (
    <XcTwapProvider
      assetIn={assetIn}
      assetOut={assetOut}
      destPlatform={destPlatform}
    >
      <XcTwapForm />
    </XcTwapProvider>
  )
}
