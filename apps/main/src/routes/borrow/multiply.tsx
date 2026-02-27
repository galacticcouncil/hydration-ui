import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { MultiplyPage } from "@/modules/borrow/multiply/MultiplyPage"

export const Route = createFileRoute("/borrow/multiply")({
  component: MultiplyPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
