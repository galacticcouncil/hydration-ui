import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PortfolioDepositsPage } from "@/modules/portfolio/deposits/PortfolioDepositsPage"

export const Route = createFileRoute("/portfolio/deposits")({
  component: PortfolioDepositsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolioDeposits", i18n.t),
  }),
})
