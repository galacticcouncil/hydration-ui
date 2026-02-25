import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { MyLiquidityTableColumnId } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import { WalletAssetsPage } from "@/modules/wallet/assets/WalletAssetsPage"
import { WalletAssetsSkeleton } from "@/modules/wallet/assets/WalletAssetsSkeleton"

const searchSchema = z.object({
  category: z.enum(["all", "assets", "liquidity"]).default("all"),
  assetsPage: z.number().optional(),
  assetsSort: dataTableSortSchema,
  liquidityPage: z.number().optional(),
  liquiditySort: dataTableSortSchema.default([
    { id: MyLiquidityTableColumnId.CurrentValue, desc: true },
  ]),
  search: z.string().optional(),
})

export type WalletAssetsCategory = z.infer<typeof searchSchema>["category"]

export const Route = createFileRoute("/wallet/assets")({
  component: WalletAssetsPage,
  pendingComponent: WalletAssetsSkeleton,
  validateSearch: searchSchema,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("wallet", i18n.t),
  }),
})
