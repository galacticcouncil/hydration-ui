import { createFileRoute } from "@tanstack/react-router"

import { PositionPage } from "@/modules/money-market-v2/PositionPage"

export const Route = createFileRoute("/money-market/position")({
  component: PositionPage,
  staticData: { crumb: () => "Your position" },
})
