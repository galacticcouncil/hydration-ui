import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/borrow/markets")({
  staticData: { crumb: true },
})
