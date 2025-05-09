import { createFileRoute } from "@tanstack/react-router"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool/CreateIsolatedPool"

export const Route = createFileRoute("/liquidity/create")({
  component: CreateIsolatedPool,
})
