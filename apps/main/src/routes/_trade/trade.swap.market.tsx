import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { Market } from "@/modules/trade/sections/Market"

const searchSchema = z.object({
  assetOut: z.string().optional(),
})

export const Route = createFileRoute("/_trade/trade/swap/market")({
  component: Market,
  validateSearch: searchSchema,
})
