import { createFileRoute } from "@tanstack/react-router"

import { Market } from "@/modules/trade/swap/sections/Market/Market"

export const Route = createFileRoute("/trade/_history/swap/market")({
  component: Market,
})
