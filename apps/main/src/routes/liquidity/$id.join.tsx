import { createFileRoute, useParams, useSearch } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"

const JoinFarmsSchema = z.object({
  positionId: z.string(),
})

export const Route = createFileRoute("/liquidity/$id/join")({
  component: RouteComponent,
  validateSearch: zodValidator(JoinFarmsSchema),
})

function RouteComponent() {
  const { id } = useParams({
    from: "/liquidity/$id/join",
  })

  const { positionId } = useSearch({
    from: "/liquidity/$id/join",
  })

  return <JoinFarms positionId={positionId} poolId={id} />
}
