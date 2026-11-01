import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { borrowHistoryFilters } from "@/modules/money-market/history/BorrowHistoryFilter.utils"
import { BorrowHistoryPage } from "@/modules/money-market/history/BorrowHistoryPage"
import { BorrowHistoryPageSkeleton } from "@/modules/money-market/MoneyMarketSkeletons"

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

export const Route = createFileRoute("/borrow/history")({
  component: BorrowHistoryPage,
  pendingComponent: BorrowHistoryPageSkeleton,
  validateSearch: searchSchema,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowHistory", i18n.t),
  }),
})
