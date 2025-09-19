import { createFileRoute } from "@tanstack/react-router"

import { StakingDashboard } from "@/modules/staking/StakingDashboard"

export const Route = createFileRoute("/staking/")({
  component: StakingDashboard,
})
