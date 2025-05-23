import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { Market } from "@/modules/trade/swap/sections/Market/Market"

const searchSchema = z.object({
  assetIn: z.string().optional(),
  assetOut: z.string().optional(),
})

export const Route = createFileRoute("/trade/_history/swap/market")({
  component: Market,
  validateSearch: searchSchema,
})
