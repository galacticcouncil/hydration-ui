import { createFileRoute } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"

import { PoolsPage } from "@/modules/liquidity/PoolsPage"

const searchSchema = z.object({
  type: fallback(
    z.enum(["all", "omnipoolStablepool", "isolated"]),
    "all",
  ).default("all"),
  myLiquidity: z.boolean().default(false),
})

export const Route = createFileRoute("/liquidity/")({
  component: PoolsPage,
  validateSearch: zodValidator(searchSchema),
})
