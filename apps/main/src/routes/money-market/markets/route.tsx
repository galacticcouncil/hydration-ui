import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/money-market/markets")({
  staticData: { crumb: true },
})
