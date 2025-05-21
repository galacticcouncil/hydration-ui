import { createFileRoute } from "@tanstack/react-router"

import { searchSchema } from "@/routes/trade/route"

export const Route = createFileRoute("/trade/_history")({
  validateSearch: searchSchema,
})
