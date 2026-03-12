import { createFileRoute } from "@tanstack/react-router"

import { StrategiesDashboard } from "@/modules/strategies/StrategiesDashboard"

export const Route = createFileRoute("/strategies/")({
  component: StrategiesDashboard,
})
