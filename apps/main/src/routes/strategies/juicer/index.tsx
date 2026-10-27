import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { StrategyPageSkeleton } from "@/modules/strategies/components/StrategyPageSkeleton"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"

const searchSchema = z.object({
  asset: z.string().optional(),
  /** opens the page at that section, e.g. a portfolio Claim at Withdrawals */
  section: z.enum(["withdrawals"]).optional(),
})

export const Route = createFileRoute("/strategies/juicer/")({
  component: PropellerVaultPage,
  pendingComponent: StrategyPageSkeleton,
  validateSearch: searchSchema,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesJuicer", i18n.t),
  }),
})
