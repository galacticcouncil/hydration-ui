import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { BorrowDashboardPage } from "@/modules/borrow/dashboard/BorrowDashboardPage"

export const Route = createFileRoute("/borrow/dashboard")({
  component: BorrowDashboardPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
