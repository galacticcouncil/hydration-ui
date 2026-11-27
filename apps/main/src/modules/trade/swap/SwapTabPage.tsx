import { Navigate, useParams } from "@tanstack/react-router"

import { swapTabLink } from "@/config/navigation"
import { Limit } from "@/modules/trade/swap/sections/Limit/Limit"
import { XcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwap"
import { TwapTab } from "@/modules/trade/swap/TwapTab"

const SWAP_TABS = {
  market: XcSwap,
  limit: Limit,
  twap: TwapTab,
} as const

type SwapTab = keyof typeof SWAP_TABS

const isSwapTab = (tab: string): tab is SwapTab => Object.hasOwn(SWAP_TABS, tab)

export const SwapTabPage = () => {
  const { tab } = useParams({ from: "/trade/_history/swap/$tab" })

  if (!isSwapTab(tab)) {
    return <Navigate {...swapTabLink("market")} />
  }

  const TabComponent = SWAP_TABS[tab]

  return <TabComponent />
}
