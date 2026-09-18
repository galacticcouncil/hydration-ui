import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { DashboardPage } from "@/modules/dashboard/DashboardPage"
import { DASHBOARD_PREVIEW_STATES } from "@/modules/dashboard/DashboardPage.preview"

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: z.object({
    preview: z
      .enum([...DASHBOARD_PREVIEW_STATES, "earner"])
      .optional()
      .catch(undefined),
  }),
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("home", i18n.t),
  }),
})
