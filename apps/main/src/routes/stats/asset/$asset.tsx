import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/stats/asset/$asset")({
  component: () => null,
})
