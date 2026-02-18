import { createFileRoute } from "@tanstack/react-router"

function PlatformOverview() {
  return null
}

export const Route = createFileRoute("/stats/overview")({
  component: PlatformOverview,
})
