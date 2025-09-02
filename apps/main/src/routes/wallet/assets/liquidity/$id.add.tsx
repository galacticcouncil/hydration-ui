import { createFileRoute, useParams } from "@tanstack/react-router"

import { AddLiquidity } from "@/modules/liquidity/components/AddLiquidity"

export const Route = createFileRoute("/wallet/assets/liquidity/$id/add")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: "/wallet/assets/liquidity/$id/add" })

  return <AddLiquidity assetId={id} />
}
