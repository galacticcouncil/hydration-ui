import { MoneyMarketProvider } from "@galacticcouncil/money-market/components"
import { createFileRoute } from "@tanstack/react-router"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const Route = createFileRoute("/_borrow/borrow")({
  component: () => (
    <MoneyMarketProvider>
      <SubpageLayout />
    </MoneyMarketProvider>
  ),
})
