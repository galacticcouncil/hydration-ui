import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router"
import z from "zod/v4"

import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { RemoveLiquiditySkeleton } from "@/modules/liquidity/components/RemoveLiquidity/RemoveLiquiditySkeleton"
import { useNavigateLiquidityBack } from "@/modules/liquidity/Liquidity.utils"

const RemoveLiquiditySchema = z.object({
  positionId: z.string().optional(),
  shareTokenId: z.string().optional(),
  stableswapId: z.string().optional(),
  selectable: z.boolean().optional(),
  erc20Id: z.string().optional(),
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

  const navigateBack = useNavigateLiquidityBack()

  return (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <RemoveLiquidity
        poolId={poolId}
        closable={false}
        onBack={navigateBack}
        onSubmitted={navigateBack}
        {...search}
      />
    </ModalContainer>
  )
}
