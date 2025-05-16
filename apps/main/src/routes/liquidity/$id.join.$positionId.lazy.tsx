import { createLazyFileRoute, useParams } from "@tanstack/react-router"

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"

export const Route = createLazyFileRoute("/liquidity/$id/join/$positionId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { positionId, id } = useParams({
    from: "/liquidity/$id/join/$positionId",
  })

  return <JoinFarms positionId={positionId} poolId={id} />
}
