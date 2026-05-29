import { createFileRoute } from "@tanstack/react-router"

import { Limit } from "@/modules/trade/swap/sections/Limit/Limit"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

export const Route = createFileRoute("/trade/_history/swap/limit")({
  component: Limit,
  pendingComponent: SwapPageSkeleton,
})
