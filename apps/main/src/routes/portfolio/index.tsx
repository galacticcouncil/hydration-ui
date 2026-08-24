import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { MyBondsTableColumnId } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"
import { MyLiquidityTableColumnId } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidityTable.columns"
import { PortfolioOverviewPage } from "@/modules/portfolio/overview/PortfolioOverviewPage"
import { PortfolioOverviewSkeleton } from "@/modules/portfolio/overview/PortfolioOverviewSkeleton"

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

export type PortfolioOverviewCategory = z.infer<typeof searchSchema>["category"]

export const Route = createFileRoute("/portfolio/")({
  component: PortfolioOverviewPage,
  pendingComponent: PortfolioOverviewSkeleton,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("portfolio", i18n.t),
  }),
})
