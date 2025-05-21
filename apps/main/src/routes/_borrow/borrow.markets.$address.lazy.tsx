import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createLazyFileRoute, useParams } from "@tanstack/react-router"

import { BorrowMarketDetailPage } from "@/modules/borrow/markets/BorrowMarketDetailPage"

const RouteComponent = () => {
  const params = useParams({
    from: "/_borrow/borrow/markets/$address",
  })

  const assetId = getAssetIdFromAddress(params.address)

  return <BorrowMarketDetailPage assetId={assetId} />
}

export const Route = createLazyFileRoute("/_borrow/borrow/markets/$address")({
  component: RouteComponent,
})
