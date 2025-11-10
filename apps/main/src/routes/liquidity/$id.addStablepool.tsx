import { ModalContainer } from "@galacticcouncil/ui/components/Modal"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createFileRoute, useParams, useRouter } from "@tanstack/react-router"

import { AddStablepoolLiquidity } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"

export const Route = createFileRoute("/liquidity/$id/addStablepool")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: "/liquidity/$id/addStablepool" })
  const { history } = useRouter()

  return (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <AddStablepoolLiquidity
        closable={false}
        id={id}
        onBack={() => history.back()}
      />
    </ModalContainer>
  )
}
