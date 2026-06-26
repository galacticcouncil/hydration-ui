import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StakingDashboard } from "@/modules/staking/StakingDashboard"

export const Route = createFileRoute("/staking-old/")({
  component: StakingDashboard,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("stakingOld", i18n.t),
  }),
})
