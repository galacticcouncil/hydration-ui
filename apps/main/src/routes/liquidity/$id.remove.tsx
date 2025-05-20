import { createFileRoute, useParams, useSearch } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import z from "zod"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"

const RemoveLiquiditySchema = z.object({
  positionId: z.union([z.literal("all"), z.string()]),
})

export const Route = createFileRoute("/liquidity/$id/remove")({
  component: RouteComponent,
  validateSearch: zodValidator(RemoveLiquiditySchema),
})

function RouteComponent() {
  const { id } = useParams({
    from: "/liquidity/$id/remove",
  })

  const { positionId } = useSearch({
    from: "/liquidity/$id/remove",
  })
  console.log(positionId)
  return <RemoveLiquidity positionId={positionId} poolId={id} />
}
