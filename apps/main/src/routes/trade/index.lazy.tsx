import { createLazyFileRoute } from "@tanstack/react-router"

import { TradePage } from "@/modules/trade/TradePage"

export const Route = createLazyFileRoute("/trade/")({
  component: TradePage,
})
