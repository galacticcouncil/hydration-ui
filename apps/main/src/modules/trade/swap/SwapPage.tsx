import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { lazy } from "react"

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
  const { isMobile, isTablet } = useBreakpoints()

  if (isMobile || isTablet) {
    return <SwapPageMobile />
  }

  return <SwapPageDesktop />
}
