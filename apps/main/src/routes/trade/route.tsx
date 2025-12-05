import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const Route = createFileRoute("/trade")({
  component: () => <SubpageLayout ignoreCurrentSearch />,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("trade", i18n.t),
  }),
})
