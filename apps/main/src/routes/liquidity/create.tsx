import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createFileRoute } from "@tanstack/react-router"

import { CreateIsolatedPool } from "@/modules/liquidity/components/CreateIsolatedPool/CreateIsolatedPool"

export const Route = createFileRoute("/liquidity/create")({
  component: () => (
    <ModalContainer
      open
      sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
    >
      <CreateIsolatedPool closable={false} />
    </ModalContainer>
  ),
})
