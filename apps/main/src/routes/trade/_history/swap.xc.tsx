import { createFileRoute } from "@tanstack/react-router"

import { XcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwap"
import { XcSwapProvider } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/_history/swap/xc")({
  component: () => (
    <XcSwapProvider>
      <XcSwap />
    </XcSwapProvider>
  ),
  pendingComponent: SwapPageSkeleton,
})
