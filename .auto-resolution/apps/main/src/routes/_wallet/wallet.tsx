import { createFileRoute, useMatch } from "@tanstack/react-router"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { WalletAssetsSubpageLayoutActions } from "@/modules/wallet/assets/WalletAssetsSubpageLayoutActions"

const WalletSubpageLayout = () => {
  const isAssetsPage = useMatch({
    from: "/_wallet/wallet/assets",
    shouldThrow: false,
  })

  const isTransactionsPage = useMatch({
    from: "/_wallet/wallet/transactions",
    shouldThrow: false,
  })

  const actions = (() => {
    return isAssetsPage || isTransactionsPage ? (
      <WalletAssetsSubpageLayoutActions />
    ) : null
  })()

  return <SubpageLayout actions={actions} />
}

export const Route = createFileRoute("/_wallet/wallet")({
  component: WalletSubpageLayout,
})
