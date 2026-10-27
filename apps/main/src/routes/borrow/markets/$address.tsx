import { createFileRoute, useParams } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import {
  ReserveCrumb,
  ReserveDetailPage,
} from "@/modules/money-market/reserve/ReserveDetailPage"

const RouteComponent = () => {
  const { address } = useParams({ from: "/borrow/markets/$address" })

  return <ReserveDetailPage address={address} />
}

export const Route = createFileRoute("/borrow/markets/$address")({
  component: RouteComponent,
  staticData: { crumb: ReserveCrumb },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("borrowMarkets", i18n.t),
  }),
})
