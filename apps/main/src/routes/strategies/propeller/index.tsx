import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"

const searchSchema = z.object({
  asset: z.string().optional(),
})

export const Route = createFileRoute("/strategies/propeller/")({
  component: PropellerVaultPage,
  validateSearch: searchSchema,
  staticData: { crumb: true },
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropeller", i18n.t),
  }),
})
