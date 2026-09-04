import { createFileRoute } from "@tanstack/react-router"

import { Dca } from "@/modules/trade/swap/sections/DCA/Dca"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/_history/swap/twap")({
  component: Dca,
  pendingComponent: SwapPageSkeleton,
})
