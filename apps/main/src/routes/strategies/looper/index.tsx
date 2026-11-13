import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { StrategyPageSkeleton } from "@/modules/strategies/components/StrategyPageSkeleton"
import { MultiplyPage } from "@/modules/strategies/multiply/MultiplyPage"

const searchSchema = z.object({
  pair: z.string().optional(),
  collateral: z.coerce.string().optional(),
  debt: z.coerce.string().optional(),
})

export const Route = createFileRoute("/strategies/looper/")({
  component: MultiplyPage,
  pendingComponent: StrategyPageSkeleton,
  validateSearch: searchSchema,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesMultiply", i18n.t),
  }),
})
