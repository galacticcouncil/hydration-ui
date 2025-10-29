import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import z from "zod/v4"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"

const RemoveLiquiditySchema = z.object({
  positionId: z.string().optional(),
  shareTokenId: z.string().optional(),
  stableswapId: z.string().optional(),
  selectable: z.boolean().optional(),
})

export type RemoveLiquidityType = z.infer<typeof RemoveLiquiditySchema>

export const Route = createFileRoute("/liquidity/$id/remove")({
  component: RouteComponent,
  validateSearch: RemoveLiquiditySchema,
  pendingComponent: () => (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <RemoveLiquiditySkeleton />
    </ModalContainer>
  ),
})

function RouteComponent() {
  const { id: poolId } = useParams({
    from: "/liquidity/$id/remove",
  })

  const search = useSearch({
    from: "/liquidity/$id/remove",
  })

  const { history } = useRouter()

  return (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <RemoveLiquidity
        poolId={poolId}
        closable={false}
        onBack={() => history.back()}
        {...search}
      />
    </ModalContainer>
  )
}
