import { createFileRoute, useMatch } from "@tanstack/react-router"
import { FC } from "react"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { WalletAssetsSubpageLayoutActions } from "@/modules/wallet/assets/WalletAssetsSubpageLayoutActions"

const WalletSubpageLayout: FC = () => {
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
      actions={
        (isAssetsPage || isTransactionsPage) && (
          <WalletAssetsSubpageLayoutActions />
        )
      }
    />
  )
}

export const Route = createFileRoute("/wallet")({
  component: WalletSubpageLayout,
})
