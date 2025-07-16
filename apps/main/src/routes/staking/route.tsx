import { createFileRoute } from "@tanstack/react-router"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"

export const Route = createFileRoute("/staking")({
  component: SubpageLayout,
})
