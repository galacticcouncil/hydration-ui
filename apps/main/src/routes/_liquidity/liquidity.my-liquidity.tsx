import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

import { MyLiquidityPage } from "@/modules/liquidity/MyLiquidityPage"

import { searchSchema } from "./liquidity.pools"

export const Route = createFileRoute("/_liquidity/liquidity/my-liquidity")({
  component: MyLiquidityPage,
  validateSearch: zodValidator(searchSchema),
})
