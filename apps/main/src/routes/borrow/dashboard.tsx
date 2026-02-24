import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { BorrowDashboardPage } from "@/modules/borrow/dashboard/BorrowDashboardPage"
import { BorrowDashboardSkeletonPage } from "@/modules/borrow/dashboard/BorrowDashboardSkeletonPage"

const searchSchema = z.object({
  suppliedSort: dataTableSortSchema,
  borrowedSort: dataTableSortSchema,
  supplyGSort: dataTableSortSchema,
  supplySort: dataTableSortSchema,
  borrowSort: dataTableSortSchema,
})

export const Route = createFileRoute("/borrow/dashboard")({
  component: BorrowDashboardPage,
  pendingComponent: BorrowDashboardSkeletonPage,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
