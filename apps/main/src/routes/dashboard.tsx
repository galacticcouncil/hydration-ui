import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { DashboardPage } from "@/modules/dashboard/DashboardPage"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("home", i18n.t),
  }),
})
