import { createLazyFileRoute } from "@tanstack/react-router"

import { SwapPage } from "@/modules/trade/swap/SwapPage"

export const Route = createLazyFileRoute("/_trade/trade/swap")({
  component: SwapPage,
})
