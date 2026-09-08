import { Navigate, useParams } from "@tanstack/react-router"

import { swapTabLink } from "@/config/navigation"
import { Dca } from "@/modules/trade/swap/sections/DCA/Dca"
import { Limit } from "@/modules/trade/swap/sections/Limit/Limit"
import { Market } from "@/modules/trade/swap/sections/Market/Market"

const SWAP_TABS = {
  market: Market,
  limit: Limit,
  twap: Dca,
} as const

type SwapTab = keyof typeof SWAP_TABS

const isSwapTab = (tab: string): tab is SwapTab => tab in SWAP_TABS

export const SwapTabPage = () => {
  const { tab } = useParams({ from: "/trade/_history/swap/$tab" })

  if (!isSwapTab(tab)) {
    return <Navigate {...swapTabLink("market")} />
  }

  const TabComponent = SWAP_TABS[tab]

  return <TabComponent />
}
