import { createFileRoute } from "@tanstack/react-router"

import { BalancesPage } from "@/modules/balances/BalancesPage"

export const Route = createFileRoute("/balances/")({
  component: BalancesPage,
})
