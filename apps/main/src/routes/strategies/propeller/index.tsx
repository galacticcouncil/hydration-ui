import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"

export const Route = createFileRoute("/strategies/propeller/")({
  component: PropellerVaultPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropeller", i18n.t),
  }),
})
