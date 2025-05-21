import { createLazyFileRoute } from "@tanstack/react-router"

import { BorrowDashboardPage } from "@/modules/borrow/dashboard/BorrowDashboardPage"

export const Route = createLazyFileRoute("/_borrow/borrow/dashboard")({
  component: BorrowDashboardPage,
})
