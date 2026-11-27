import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"

import { Dca } from "@/modules/trade/swap/sections/DCA/Dca"
import { XcTwap } from "@/modules/trade/swap/sections/XcTwap/XcTwap"

export const TwapTab: FC = () => {
  const { destPlatform } = useSearch({ from: "/trade/_history" })

  return destPlatform === HYDRATION_CHAIN_KEY ? <Dca /> : <XcTwap />
}
