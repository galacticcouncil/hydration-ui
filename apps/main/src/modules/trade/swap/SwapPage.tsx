import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Navigate, useMatchRoute } from "@tanstack/react-router"
import { lazy } from "react"

import { LINKS } from "@/config/navigation"
import { IntentsOnboardingModal } from "@/modules/trade/swap/components/IntentsOnboardingModal"
import { useResetSharedSellAmountOnUnmount } from "@/modules/trade/swap/lib/useSharedSellAmount"
import { useIsIceEnabled } from "@/states/intents"

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
  const isIceEnabled = useIsIceEnabled()
  const matchRoute = useMatchRoute()
  const isLimitPage = !!matchRoute({ to: LINKS.swapLimit })

  const content =
    isLimitPage && !isIceEnabled ? (
      <Navigate to={LINKS.swapMarket} />
    ) : !gte("lg") ? (
      <SwapPageMobile />
    ) : (
      <SwapPageDesktop />
    )

  return (
    <>
      {content}
      <IntentsOnboardingModal />
    </>
  )
}
