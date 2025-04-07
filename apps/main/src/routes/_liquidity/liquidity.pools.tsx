import { createFileRoute } from "@tanstack/react-router"
import { fallback, zodValidator } from "@tanstack/zod-adapter"
import * as z from "zod"

import { PoolsPage } from "@/modules/liquidity/PoolsPage"

export type PoolType = "all" | "omnipoolStablepool" | "isolated"

export const searchSchema = z.object({
  type: fallback(
    z.enum(["all", "omnipoolStablepool", "isolated"]),
    "all",
  ).default("all"),
  id: z.string().optional(),
})

export const Route = createFileRoute("/_liquidity/liquidity/pools")({
  component: PoolsPage,
  validateSearch: zodValidator(searchSchema),
})
