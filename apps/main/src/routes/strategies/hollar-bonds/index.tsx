import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"

export const Route = createFileRoute("/strategies/hollar-bonds/")({
  component: StableBondsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHollarBonds", i18n.t),
  }),
})
