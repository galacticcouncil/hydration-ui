import { createLazyFileRoute } from "@tanstack/react-router"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool/CreateIsolatedPool"

export const Route = createLazyFileRoute("/liquidity/create")({
  component: CreateIsolatedPool,
})
