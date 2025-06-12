import { createFileRoute } from "@tanstack/react-router"

import { BorrowDashboardPage } from "@/modules/borrow/dashboard/BorrowDashboardPage"

export const Route = createFileRoute("/borrow/dashboard")({
  component: BorrowDashboardPage,
})
