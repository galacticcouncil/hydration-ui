import { Outlet } from "@tanstack/react-location"
import { useRpcProvider } from "providers/rpcProvider"
import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { LendingDashboardSkeleton } from "sections/lending/skeleton/LendingDashboardSkeleton"
import { useMarketChangeSubscription } from "sections/lending/utils/marketsAndNetworksConfig"

export const LendingPage = () => {
  useMarketChangeSubscription()

  const { isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return <LendingDashboardSkeleton />
  }

  return (
    <LendingPageProviders>
      <Outlet />
    </LendingPageProviders>
  )
}
