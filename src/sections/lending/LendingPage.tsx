import { Navigate, Outlet } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"

import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { LendingDashboardSkeleton } from "sections/lending/skeleton/LendingDashboardSkeleton"
import { MoneyMarketCountdown } from "sections/lending/ui/money-market/MoneyMarketCountdown"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"

export const LendingPage = () => {
  useMarketChangeSubscription()

  const { featureFlags, isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return <LendingDashboardSkeleton />
  }

  if (!featureFlags.borrow) {
    return <Navigate to="/" />
  }

  if (!featureFlags.borrowContractApproved) {
    return <MoneyMarketCountdown />
  }
  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
