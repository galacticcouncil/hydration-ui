import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { MarketsPage } from "@/modules/money-market/markets/MarketsPage"

const searchSchema = z.object({
  sort: dataTableSortSchema,
  search: z.string().optional(),
})

export const Route = createFileRoute("/borrow/markets/")({
  component: MarketsPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowMarkets", i18n.t),
  }),
})
