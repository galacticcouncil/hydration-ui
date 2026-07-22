import { createFileRoute } from "@tanstack/react-router"

import { StrategiesPage } from "@/modules/strategies/StrategiesPage"

export const Route = createFileRoute("/strategies/")({
  component: StrategiesPage,
})
