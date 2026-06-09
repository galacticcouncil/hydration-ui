import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { PropellerVaultProvider } from "@/modules/strategies/propeller/PropellerVaultContext"
import { PropellerVaultPage } from "@/modules/strategies/propeller/PropellerVaultPage"
import { getPropellerVault } from "@/modules/strategies/propeller/vaults"

export const Route = createFileRoute("/strategies/propeller/$asset/")({
  component: RouteComponent,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("strategiesPropeller", i18n.t),
  }),
})

function RouteComponent() {
  const { asset } = Route.useParams()
  return (
    <PropellerVaultProvider vault={getPropellerVault(asset)}>
      <PropellerVaultPage />
    </PropellerVaultProvider>
  )
}
