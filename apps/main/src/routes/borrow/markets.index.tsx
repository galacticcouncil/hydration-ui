import { createFileRoute } from "@tanstack/react-router"

import { BorrowMarketsPage } from "@/modules/borrow/markets/BorrowMarketsPage"

export const Route = createFileRoute("/borrow/markets/")({
  component: BorrowMarketsPage,
})
