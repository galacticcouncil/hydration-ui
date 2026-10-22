import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { MoneyMarketDashboard } from "@/modules/money-market/MoneyMarketDashboard"

const searchSchema = z.object({
  supplyCategory: z
    .enum(["stable", "dot", "eth", "btc", "sol", "other"])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute("/borrow/")({
  component: MoneyMarketDashboard,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowDashboard", i18n.t),
  }),
})
