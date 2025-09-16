import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { isSS58Address } from "@galacticcouncil/utils"
import { createFileRoute, useParams } from "@tanstack/react-router"

import { AddIsolatedLiquidity } from "@/modules/liquidity/components/AddIsolatediquidity"
import { AddLiquidity } from "@/modules/liquidity/components/AddLiquidity"

export const Route = createFileRoute("/liquidity/$id/add")({
  component: function Component() {
    const { id } = useParams({ from: "/liquidity/$id/add" })

    return (
      <ModalContainer
        open
        sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
      >
        <AddLiquidityModalContent id={id} closable={false} />
      </ModalContainer>
    )
  },
})

export function AddLiquidityModalContent({
  id,
  closable,
}: {
  readonly id: string
  readonly closable?: boolean
}) {
  return isSS58Address(id) ? (
    <AddIsolatedLiquidity poolAddress={id} closable={closable} />
  ) : (
    <AddLiquidity assetId={id} closable={closable} />
  )
}
