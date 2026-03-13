import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { MultiplyPage } from "@/modules/borrow/multiply/MultiplyPage"
import { MultiplyPageSkeleton } from "@/modules/borrow/multiply/MultiplyPageSkeleton"

export const Route = createFileRoute("/borrow/multiply/")({
  pendingComponent: MultiplyPageSkeleton,
  component: MultiplyPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrow", i18n.t),
  }),
})
