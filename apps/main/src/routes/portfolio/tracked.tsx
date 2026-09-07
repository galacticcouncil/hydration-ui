import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { PortfolioTrackedPage } from "@/modules/portfolio/tracked/PortfolioTrackedPage"

const searchSchema = z.object({
  assetsSort: dataTableSortSchema,
  search: z.string().optional(),
})

export const Route = createFileRoute("/portfolio/tracked")({
  component: PortfolioTrackedPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolioTracked", i18n.t),
  }),
})
