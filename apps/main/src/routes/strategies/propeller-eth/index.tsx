import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/vaults"

export const Route = createFileRoute("/strategies/propeller-eth/")({
  component: () => <PropellerVaultPage vault={PROPELLER_VAULTS.eth} />,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropellerEth", i18n.t),
  }),
})
