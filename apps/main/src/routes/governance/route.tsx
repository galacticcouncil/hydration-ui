import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const Route = createFileRoute("/governance")({
  component: SubpageLayout,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("governance", i18n.t),
  }),
})
