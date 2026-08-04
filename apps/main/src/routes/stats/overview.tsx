import { createFileRoute } from "@tanstack/react-router"

import { Overview } from "@/modules/stats/overview/Overview"

export const Route = createFileRoute("/stats/overview")({
  component: Overview,
})
