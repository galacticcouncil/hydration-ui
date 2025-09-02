import { useMatch } from "@tanstack/react-router"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"
import { LiquidityBreadcrumb } from "@/modules/liquidity/components/Breadcrumb/LiquidityBreadcrumb"

export const LiquiditySubpageMenu = () => {
  const isPoolsPage = useMatch({
    from: "/liquidity/",
    shouldThrow: false,
  })

  if (!isPoolsPage) return <LiquidityBreadcrumb />

  return <SubpageMenu />
}
