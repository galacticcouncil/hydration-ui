import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StrategyPageSkeleton } from "@/modules/strategies/components/StrategyPageSkeleton"
import { useStableBonds } from "@/modules/strategies/stable-bonds/hooks/useStableBonds"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"

const RouteComponent = () => {
  const { active, isReady } = useStableBonds()

  if (!isReady) return <StrategyPageSkeleton />

  return active ? <StableBondsPage bondId={active.id} /> : null
}

export const Route = createFileRoute("/strategies/hollar-bonds/")({
  component: RouteComponent,
  pendingComponent: StrategyPageSkeleton,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHollarBonds", i18n.t),
  }),
})
