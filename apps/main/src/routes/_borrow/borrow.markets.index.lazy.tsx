import { createLazyFileRoute } from "@tanstack/react-router"

import { BorrowMarketsPage } from "@/modules/borrow/markets/BorrowMarketsPage"

export const Route = createLazyFileRoute("/_borrow/borrow/markets/")({
  component: BorrowMarketsPage,
})
