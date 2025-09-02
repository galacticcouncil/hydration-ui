import { createFileRoute, useParams, useSearch } from "@tanstack/react-router"
import { z } from "zod/v4"

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"

const JoinFarmsSchema = z.object({
  positionId: z.string(),
})

export const Route = createFileRoute("/wallet/assets/liquidity/$id/join")({
  component: RouteComponent,
  validateSearch: JoinFarmsSchema,
})

function RouteComponent() {
  const { id } = useParams({
    from: "/wallet/assets/liquidity/$id/join",
  })

  const { positionId } = useSearch({
    from: "/wallet/assets/liquidity/$id/join",
  })

  return <JoinFarms positionId={positionId} poolId={id} />
}
