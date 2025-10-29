import { createFileRoute, useParams } from "@tanstack/react-router"

import { BorrowMarketDetailPage } from "@/modules/borrow/markets/BorrowMarketDetailPage"

const RouteComponent = () => {
  const params = useParams({
    from: "/borrow/markets/$address",
  })

  return <BorrowMarketDetailPage address={params.address} />
}

export const Route = createFileRoute("/borrow/markets/$address")({
  component: RouteComponent,
})
