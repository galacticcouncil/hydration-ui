import { createFileRoute, useParams } from "@tanstack/react-router"

import {
  ReserveCrumb,
  ReserveDetailPage,
} from "@/modules/money-market-v2/ReserveDetailPage"

const RouteComponent = () => {
  const { address } = useParams({ from: "/money-market/$address" })

  return <ReserveDetailPage address={address} />
}

export const Route = createFileRoute("/money-market/$address")({
  component: RouteComponent,
  staticData: { crumb: ReserveCrumb },
})
