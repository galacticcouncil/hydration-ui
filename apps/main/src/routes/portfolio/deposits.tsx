import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { PortfolioDepositsPage } from "@/modules/portfolio/deposits/PortfolioDepositsPage"

const searchSchema = z.object({
  depositStatus: z
    .enum(["all", "pending", "completed", "attention"])
    .catch("all")
    .default("all"),
})

export const Route = createFileRoute("/portfolio/deposits")({
  component: PortfolioDepositsPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolioDeposits", i18n.t),
  }),
})
