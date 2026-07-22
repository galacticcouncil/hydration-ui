import { createFileRoute, redirect } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"

// The single shared Propeller subpage — every collateral vault (ETH, tBTC, …)
// is reachable here via the in-page collateral switcher (no per-asset route).
export const Route = createFileRoute("/strategies/propeller/")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: "/strategies" })
    }
  },
  component: PropellerVaultPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropeller", i18n.t),
  }),
})
