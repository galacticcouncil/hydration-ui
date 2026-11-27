import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { lazy, Suspense } from "react"

import { useResetSharedSellAmountOnUnmount } from "@/modules/trade/swap/lib/useSharedSellAmount"
import { SwapPageSkeleton } from "@/modules/trade/swap/SwapPageSkeleton"

const SwapPageDesktop = lazy(async () => ({
  default: await import("@/modules/trade/swap/SwapPageDesktop").then(
    (m) => m.SwapPageDesktop,
  ),
}))

const SwapPageMobile = lazy(async () => ({
  default: await import("@/modules/trade/swap/SwapPageMobile").then(
    (m) => m.SwapPageMobile,
  ),
}))

export const SwapPage = () => {
  useResetSharedSellAmountOnUnmount()

  const { gte } = useBreakpoints()

  const content = !gte("lg") ? <SwapPageMobile /> : <SwapPageDesktop />

  return <Suspense fallback={<SwapPageSkeleton />}>{content}</Suspense>
}
