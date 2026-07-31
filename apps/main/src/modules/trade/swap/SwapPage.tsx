import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { lazy } from "react"

import { useResetSharedSellAmountOnUnmount } from "@/modules/trade/swap/lib/useSharedSellAmount"

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

  if (!gte("lg")) {
    return <SwapPageMobile />
  }

  return <SwapPageDesktop />
}
