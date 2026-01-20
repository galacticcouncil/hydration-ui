import { useAccount } from "@galacticcouncil/web3-connect"
import { createFileRoute, useMatch } from "@tanstack/react-router"
import { FC } from "react"

import { getPageMeta } from "@/config/navigation"
import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { WalletAssetsSubpageLayoutActions } from "@/modules/wallet/assets/WalletAssetsSubpageLayoutActions"

const WalletSubpageLayout: FC = () => {
  const { account } = useAccount()

  const isAssetsPage = useMatch({
    from: "/wallet/assets",
    shouldThrow: false,
  })

  const isTransactionsPage = useMatch({
    from: "/wallet/transactions",
    shouldThrow: false,
  })

  return (
    <SubpageLayout
      alwasShowSubNav
      actions={
        (isAssetsPage || isTransactionsPage) &&
        account && <WalletAssetsSubpageLayoutActions />
      }
    />
  )
}

export const Route = createFileRoute("/wallet")({
  component: WalletSubpageLayout,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("wallet", i18n.t),
  }),
})
