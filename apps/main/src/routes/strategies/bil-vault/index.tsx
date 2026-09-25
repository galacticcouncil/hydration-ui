import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { BilVaultPage } from "@/modules/strategies/bil/BilVaultPage"
import { StrategyPageSkeleton } from "@/modules/strategies/components/StrategyPageSkeleton"

export const Route = createFileRoute("/strategies/bil-vault/")({
  component: BilVaultPage,
  pendingComponent: StrategyPageSkeleton,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesBil", i18n.t),
  }),
})
