import { createFileRoute, useParams } from "@tanstack/react-router"

import { AddLiquidity } from "@/modules/liquidity/components/AddLiquidity"

export const Route = createFileRoute("/liquidity/$id/add")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: "/liquidity/$id/add" })

  return <AddLiquidity assetId={id} />
}
