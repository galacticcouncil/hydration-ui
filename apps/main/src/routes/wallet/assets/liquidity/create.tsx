import { createFileRoute } from "@tanstack/react-router"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool/CreateIsolatedPool"

export const Route = createFileRoute("/wallet/assets/liquidity/create")({
  component: CreateIsolatedPool,
})
