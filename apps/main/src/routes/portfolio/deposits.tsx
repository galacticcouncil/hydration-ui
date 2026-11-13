import { createFileRoute, notFound } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { isBankFlowEnabled } from "@/modules/onramp/bank/utils/bankAvailability"
import { PortfolioDepositsPage } from "@/modules/portfolio/deposits/PortfolioDepositsPage"

export const Route = createFileRoute("/portfolio/deposits")({
  // Not in production: a direct URL is a 404 there (isBankFlowEnabled).
  beforeLoad: () => {
    if (!isBankFlowEnabled()) throw notFound()
  },
  component: PortfolioDepositsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolioDeposits", i18n.t),
  }),
})
