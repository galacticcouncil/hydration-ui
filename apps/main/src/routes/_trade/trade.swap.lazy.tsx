import { createLazyFileRoute } from "@tanstack/react-router"

import { SwapPage } from "@/modules/trade/TradePage"

export const Route = createLazyFileRoute("/_trade/trade/swap")({
  component: SwapPage,
})
