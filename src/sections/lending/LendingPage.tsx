import { Outlet } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { LendingDashboardSkeleton } from "sections/lending/skeleton/LendingDashboardSkeleton"
import { MoneyMarketCountdown } from "sections/lending/ui/money-market/MoneyMarketCountdown"

export const LendingPage = () => {
  const { featureFlags, isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return <LendingDashboardSkeleton />
  }

  if (!featureFlags.moneyMarket) {
    return <MoneyMarketCountdown />
  }
  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
