import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod/v4"

import { PoolsPage } from "@/modules/liquidity/PoolsPage"

const searchSchema = z.object({
  type: z.enum(["all", "omnipoolStablepool", "isolated"]).default("all"),
  myLiquidity: z.boolean().default(false),
})

export const Route = createFileRoute("/liquidity/")({
  component: PoolsPage,
  validateSearch: searchSchema,
})
