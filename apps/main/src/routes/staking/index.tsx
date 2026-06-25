import { createFileRoute, Navigate } from "@tanstack/react-router"

import { LINKS } from "@/config/navigation"
import { useRpcProvider } from "@/providers/rpcProvider"

const StakingComponent = () => {
  const { featureFlags } = useRpcProvider()
  if (featureFlags.gigaStakingEnabled) {
    return <Navigate to={LINKS.stakingGigaStake} />
  }
  return <Navigate to={LINKS.stakingOverview} />
}

export const Route = createFileRoute("/staking/")({
  component: StakingComponent,
})
