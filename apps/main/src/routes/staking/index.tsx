import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { GigaStakePage } from "@/modules/staking/gigaStaking/GigaStakePage"

export const Route = createFileRoute("/staking/")({
  component: GigaStakePage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("staking", i18n.t),
  }),
})
