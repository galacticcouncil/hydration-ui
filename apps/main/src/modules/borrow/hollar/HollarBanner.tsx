import { getGhoReserve } from "@galacticcouncil/money-market/utils"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, lazy } from "react"

import { useBorrowReserves } from "@/api/borrow"

const HollarBannerMobile = lazy(async () => ({
  default: await import("@/modules/borrow/hollar/HollarBanner.mobile").then(
    (m) => m.HollarBannerMobile,
  ),
}))

const HollarBannerDesktop = lazy(async () => ({
  default: await import("@/modules/borrow/hollar/HollarBanner.desktop").then(
    (m) => m.HollarBannerDesktop,
  ),
}))

export const HollarBanner: FC = () => {
  const { gte } = useBreakpoints()

  const { data: reserves, isLoading: isLoadingReserves } = useBorrowReserves()

  const reserve = reserves?.formattedReserves
    ? getGhoReserve(reserves.formattedReserves)
    : null

  if (gte("md")) {
    return (
      <HollarBannerDesktop
        reserve={reserve}
        isLoadingReserves={isLoadingReserves}
      />
    )
  }

  return <HollarBannerMobile reserve={reserve} />
}
