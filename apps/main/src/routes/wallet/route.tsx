import { createFileRoute, useMatch, useMatches } from "@tanstack/react-router"
import { FC } from "react"

import { SubpageLayout } from "@/modules/layout/SubpageLayout"
import { LiquidityBreadcrumb } from "@/modules/liquidity/components/Breadcrumb/LiquidityBreadcrumb"
import { WalletAssetsSubpageLayoutActions } from "@/modules/wallet/assets/WalletAssetsSubpageLayoutActions"

const WalletSubpageLayout: FC = () => {
  const isAssetsPage = useMatch({
    from: "/wallet/assets/",
    shouldThrow: false,
  })

  const isLiquidityPage = useMatches({
    select: (matches) =>
      matches.some((match) => match.fullPath.includes("liquidity")),
  })

  const isTransactionsPage = useMatch({
    from: "/wallet/transactions",
    shouldThrow: false,
  })

  return (
    <SubpageLayout
      subpageMenu={isLiquidityPage && <LiquidityBreadcrumb />}
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
