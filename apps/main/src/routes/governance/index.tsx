import { createFileRoute } from "@tanstack/react-router"

import { GovernancePage } from "@/modules/governance/GovernancePage"

export const Route = createFileRoute("/governance/")({
  component: GovernancePage,
})
