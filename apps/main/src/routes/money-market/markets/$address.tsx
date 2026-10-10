import { createFileRoute, useParams } from "@tanstack/react-router"

import {
  ReserveCrumb,
  ReserveDetailPage,
} from "@/modules/money-market-v2/ReserveDetailPage"

const RouteComponent = () => {
  const { address } = useParams({ from: "/money-market/markets/$address" })

  return <ReserveDetailPage address={address} />
}

export const Route = createFileRoute("/money-market/markets/$address")({
  component: RouteComponent,
  staticData: { crumb: ReserveCrumb },
})
