import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { PoolsPage } from "@/modules/liquidity/PoolsPage"

const searchSchema = z.object({
  type: z.enum(["all", "omnipoolStablepool", "isolated"]).default("all"),
  myLiquidity: z.boolean().default(false),
  omniSort: dataTableSortSchema.default([{ id: "id", desc: true }]),
  isolatedPage: z.number().optional(),
  isolatedSort: dataTableSortSchema.default([{ id: "tvlDisplay", desc: true }]),
  search: z.string().optional(),
})

export const Route = createFileRoute("/liquidity/")({
  component: PoolsPage,
  validateSearch: searchSchema,
})
