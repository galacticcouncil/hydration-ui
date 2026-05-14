import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Navigate, useMatchRoute } from "@tanstack/react-router"
import { lazy } from "react"

import { LINKS } from "@/config/navigation"
import { useRpcProvider } from "@/providers/rpcProvider"

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
  const { gte } = useBreakpoints()
  const { featureFlags } = useRpcProvider()
  const matchRoute = useMatchRoute()
  const isLimitPage = !!matchRoute({ to: LINKS.swapLimit })

  if (isLimitPage && !featureFlags.isIceEnabled) {
    return <Navigate to={LINKS.swapMarket} />
  }

  if (!gte("lg")) {
    return <SwapPageMobile />
  }

  return <SwapPageDesktop />
}
