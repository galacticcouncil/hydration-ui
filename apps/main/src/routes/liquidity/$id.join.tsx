import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router"
import { z } from "zod/v4"

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"

const JoinFarmsSchema = z.object({
  positionId: z.string(),
})

export const Route = createFileRoute("/liquidity/$id/join")({
  component: RouteComponent,
  validateSearch: JoinFarmsSchema,
})

function RouteComponent() {
  const { id } = useParams({
    from: "/liquidity/$id/join",
  })

  const { positionId } = useSearch({
    from: "/liquidity/$id/join",
  })

  return (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <JoinFarms positionId={positionId} poolId={id} closable={false} />
    </ModalContainer>
  )
}
