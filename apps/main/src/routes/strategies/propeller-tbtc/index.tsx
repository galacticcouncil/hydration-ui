import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/vaults"

export const Route = createFileRoute("/strategies/propeller-tbtc/")({
  component: () => <PropellerVaultPage vault={PROPELLER_VAULTS.tbtc} />,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropellerTbtc", i18n.t),
  }),
})
