import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { BorrowMarketsPage } from "@/modules/borrow/markets/BorrowMarketsPage"

export const Route = createFileRoute("/borrow/markets/")({
  component: BorrowMarketsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowMarkets", i18n.t),
  }),
})
