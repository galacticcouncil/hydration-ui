import { createFileRoute } from "@tanstack/react-router"

import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"
import { SwapTabPage } from "@/modules/trade/swap/SwapTabPage"

export const Route = createFileRoute("/trade/_history/swap/$tab")({
  component: SwapTabPage,
  pendingComponent: SwapPageSkeleton,
})
