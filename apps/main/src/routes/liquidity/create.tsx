import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createFileRoute } from "@tanstack/react-router"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool/CreateIsolatedPool"
import { useNavigateLiquidityBack } from "@/modules/liquidity/Liquidity.utils"

export const Route = createFileRoute("/liquidity/create")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigateBack = useNavigateLiquidityBack()

  return (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <CreateIsolatedPool
        closable={false}
        onBack={navigateBack}
        onSubmitted={navigateBack}
      />
    </ModalContainer>
  )
}
