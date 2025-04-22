import { createLazyFileRoute } from "@tanstack/react-router"

import { Market } from "@/modules/trade/sections/Market"

export const Route = createLazyFileRoute("/_trade/trade/swap/market")({
  component: Market,
})
