import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { MoneyMarketDashboard } from "@/modules/money-market/MoneyMarketDashboard"

export const Route = createFileRoute("/borrow/")({
  component: MoneyMarketDashboard,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowDashboard", i18n.t),
  }),
})
