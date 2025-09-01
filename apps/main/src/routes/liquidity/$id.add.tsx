import { isSS58Address } from "@galacticcouncil/utils"
import { createFileRoute, useParams } from "@tanstack/react-router"

import { AddIsolatedLiquidity } from "@/modules/liquidity/components/AddIsolatediquidity"
import { AddLiquidity } from "@/modules/liquidity/components/AddLiquidity"

export const Route = createFileRoute("/liquidity/$id/add")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = useParams({ from: "/liquidity/$id/add" })

  const isAddress = isSS58Address(id)

  return isAddress ? (
    <AddIsolatedLiquidity poolAddress={id} />
  ) : (
    <AddLiquidity assetId={id} />
  )
}
