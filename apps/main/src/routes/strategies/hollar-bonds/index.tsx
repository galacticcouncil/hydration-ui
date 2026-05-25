import { HOLLAR_BOND_25_08_26 } from "@galacticcouncil/utils"
import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { StableBondsPage } from "@/modules/strategies/stable-bonds/StableBondsPage"
import { StableBondsPageSkeleton } from "@/modules/strategies/stable-bonds/StableBondsPageSkeleton"

export const Route = createFileRoute("/strategies/hollar-bonds/")({
  component: () => <StableBondsPage bondId={HOLLAR_BOND_25_08_26} />,
  pendingComponent: StableBondsPageSkeleton,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesHollarBonds", i18n.t),
  }),
})
