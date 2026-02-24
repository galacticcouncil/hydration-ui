import { createFileRoute } from "@tanstack/react-router"

import { Market } from "@/modules/trade/swap/sections/Market/Market"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/_history/swap/market")({
  component: Market,
  pendingComponent: SwapPageSkeleton,
})
