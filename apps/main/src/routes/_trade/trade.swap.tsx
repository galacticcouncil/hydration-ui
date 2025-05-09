import { createFileRoute } from "@tanstack/react-router"

import { SwapPage } from "@/modules/trade/swap/SwapPage"

export const Route = createFileRoute("/_trade/trade/swap")({
  component: SwapPage,
})
