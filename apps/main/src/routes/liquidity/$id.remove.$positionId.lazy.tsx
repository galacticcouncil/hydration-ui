import { createLazyFileRoute, useParams } from "@tanstack/react-router"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"

export const Route = createLazyFileRoute("/liquidity/$id/remove/$positionId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { positionId, id } = useParams({
    from: "/liquidity/$id/remove/$positionId",
  })

  return <RemoveLiquidity positionId={positionId} poolId={id} />
}
