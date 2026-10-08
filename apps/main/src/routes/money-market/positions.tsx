import { createFileRoute } from "@tanstack/react-router"

import { PositionsPage } from "@/modules/money-market-v2/PositionsPage"

export const Route = createFileRoute("/money-market/positions")({
  component: PositionsPage,
  staticData: { crumb: () => "Positions" },
})
