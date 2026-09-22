import { createFileRoute } from "@tanstack/react-router"

import { MoneyMarketV2Page } from "@/modules/money-market-v2/MoneyMarketV2Page"

export const Route = createFileRoute("/money-market")({
  component: MoneyMarketV2Page,
})
