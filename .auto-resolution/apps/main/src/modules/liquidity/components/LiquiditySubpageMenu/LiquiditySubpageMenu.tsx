import { useLocation } from "@tanstack/react-router"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"
import { LiquidityBreadcrumb } from "@/modules/liquidity/components/Breadcrumb/LiquidityBreadcrumb"

export const LiquiditySubpageMenu = () => {
  const location = useLocation()
  const isPoolsPage = location.pathname === "/liquidity"

  if (!isPoolsPage) return <LiquidityBreadcrumb />

  return <SubpageMenu />
}
