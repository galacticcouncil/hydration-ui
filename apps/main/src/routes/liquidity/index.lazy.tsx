import { createLazyFileRoute } from "@tanstack/react-router"

import { LiquidityPage } from "@/modules/liquidity/LiquidityPage"

export const Route = createLazyFileRoute("/liquidity/")({
  component: LiquidityPage,
})
