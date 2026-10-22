import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { useStableBonds } from "@/modules/strategies/stable-bonds/hooks/useStableBonds"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"
import { StableBondsPageSkeleton } from "@/modules/strategies/stable-bonds/StableBondsPageSkeleton"

const RouteComponent = () => {
  const { active, isReady } = useStableBonds()

  if (!isReady) return <StableBondsPageSkeleton />

  return active ? <StableBondsPage bondId={active.id} /> : null
}

export const Route = createFileRoute("/strategies/hollar-bonds/")({
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
