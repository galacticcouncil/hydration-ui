import { createFileRoute, redirect } from "@tanstack/react-router"

import { normalizeSearchForSwapTab } from "@/modules/trade/swap/lib/swapTabSearch"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"
import { SwapTabPage } from "@/modules/trade/swap/SwapTabPage"

export const Route = createFileRoute("/trade/_history/swap/$tab")({
  beforeLoad: ({ params, search }) => {
    const normalized = normalizeSearchForSwapTab(params.tab, search)

    if (
      normalized.assetIn !== search.assetIn ||
      normalized.assetOut !== search.assetOut ||
      normalized.destPlatform !== search.destPlatform
    ) {
      throw redirect({
        search: normalized,
        replace: true,
      })
    }
  },
  component: SwapTabPage,
  pendingComponent: SwapPageSkeleton,
})
