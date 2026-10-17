import { createFileRoute } from "@tanstack/react-router"

import { MoneyMarketV2Dashboard } from "@/modules/money-market-v2/MoneyMarketV2Dashboard"

export const Route = createFileRoute("/money-market/")({
  component: MoneyMarketV2Dashboard,
})
