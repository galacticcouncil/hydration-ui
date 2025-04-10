import { createFileRoute } from "@tanstack/react-router"

import { PoolDetails } from "@/modules/liquidity/PoolDetails"

export const Route = createFileRoute("/_liquidity/liquidity/$id")({
  component: RouteComponent,
})

function RouteComponent() {
  return <PoolDetails />
}
