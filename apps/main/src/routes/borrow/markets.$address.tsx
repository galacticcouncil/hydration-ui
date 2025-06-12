import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createFileRoute, useParams } from "@tanstack/react-router"

import { BorrowMarketDetailPage } from "@/modules/borrow/markets/BorrowMarketDetailPage"

const RouteComponent = () => {
  const params = useParams({
    from: "/borrow/markets/$address",
  })

  const assetId = getAssetIdFromAddress(params.address)

  return <BorrowMarketDetailPage assetId={assetId} />
}

export const Route = createFileRoute("/borrow/markets/$address")({
  component: RouteComponent,
})
