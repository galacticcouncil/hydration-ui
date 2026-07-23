import { createFileRoute } from "@tanstack/react-router"

import { MarketSwap } from "@/modules/trade/swap/sections/Market/MarketSwap"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/_history/swap/market")({
  component: MarketSwap,
  pendingComponent: SwapPageSkeleton,
})
