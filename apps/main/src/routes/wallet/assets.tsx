import { createFileRoute, Navigate } from "@tanstack/react-router"
import * as z from "zod/v4"

import { LINKS } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { MyBondsTableColumnId } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"
import { MyLiquidityTableColumnId } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.columns"

const searchSchema = z.object({
  category: z
    .enum(["assets", "liquidity", "bonds"])
    .catch("assets")
    .default("assets"),
  assetsSort: dataTableSortSchema,
  bondsPage: z.number().optional(),
  bondsSort: dataTableSortSchema.default([
    { id: MyBondsTableColumnId.Total, desc: true },
  ]),
  liquidityPage: z.number().optional(),
  liquiditySort: dataTableSortSchema.default([
    { id: MyLiquidityTableColumnId.CurrentValue, desc: true },
  ]),
  search: z.string().optional(),
})

const WalletAssetsRedirect = () => {
  const search = Route.useSearch()
  return <Navigate to={LINKS.portfolio} search={search} replace />
}

export const Route = createFileRoute("/wallet/assets")({
  component: WalletAssetsRedirect,
  validateSearch: searchSchema,
})
