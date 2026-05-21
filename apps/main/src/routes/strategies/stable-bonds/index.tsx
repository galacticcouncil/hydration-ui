import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"

export const Route = createFileRoute("/strategies/stable-bonds/")({
  component: StableBondsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesStableBonds", i18n.t),
  }),
})
