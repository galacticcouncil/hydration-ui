import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SwapPage } from "@/modules/trade/swap/SwapPage"

export const Route = createFileRoute("/trade/_history/swap")({
  component: SwapPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("swap", i18n.t),
  }),
})
