import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const Route = createFileRoute("/staking")({
  component: SubpageLayout,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("staking", i18n.t),
  }),
})
