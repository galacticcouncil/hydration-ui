import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PerpsPage } from "@/modules/perps/PerpsPage"

export const Route = createFileRoute("/trade/perps")({
  component: PerpsPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("perps", i18n.t),
  }),
})
