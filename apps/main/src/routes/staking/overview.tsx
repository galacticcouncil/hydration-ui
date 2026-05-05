import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StakingDashboard } from "@/modules/staking/StakingDashboard"

export const Route = createFileRoute("/staking/overview")({
  component: StakingDashboard,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("stakingOverview", i18n.t),
  }),
})
