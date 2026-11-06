import { createFileRoute, useParams } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StrategyPageSkeleton } from "@/modules/strategies/components/StrategyPageSkeleton"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"

const RouteComponent = () => {
  const { bondId } = useParams({ from: "/strategies/hollar-bonds/$bondId" })

  return <StableBondsPage bondId={bondId} isDetail />
}

export const Route = createFileRoute("/strategies/hollar-bonds/$bondId")({
  component: RouteComponent,
  pendingComponent: StrategyPageSkeleton,
  staticData: {
    crumb: {
      type: "asset",
      param: "bondId",
      from: "/strategies/hollar-bonds/$bondId",
    },
  },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHollarBonds", i18n.t),
  }),
})
