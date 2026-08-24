import { createFileRoute, useParams } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"
import { StableBondsPageSkeleton } from "@/modules/strategies/stable-bonds/StableBondsPageSkeleton"

const RouteComponent = () => {
  const { bondId } = useParams({ from: "/strategies/hollar-bonds/$bondId" })

  return <StableBondsPage bondId={bondId} isDetail />
}

export const Route = createFileRoute("/strategies/hollar-bonds/$bondId")({
  component: RouteComponent,
  pendingComponent: StableBondsPageSkeleton,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHollarBonds", i18n.t),
  }),
})
