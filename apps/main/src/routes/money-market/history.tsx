import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { borrowHistoryFilters } from "@/modules/borrow/history/BorrowHistoryFilter.utils"
import { BorrowHistoryPage } from "@/modules/borrow/history/BorrowHistoryPage"

const filterTypeSchema = z
  .array(z.enum(borrowHistoryFilters))
  .readonly()
  .optional()

const searchSchema = z.object({
  type: filterTypeSchema,
  page: z.number().optional(),
  sort: dataTableSortSchema,
  search: z.string().optional(),
})

export const Route = createFileRoute("/money-market/history")({
  component: BorrowHistoryPage,
  validateSearch: searchSchema,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("moneyMarketHistory", i18n.t),
  }),
})
