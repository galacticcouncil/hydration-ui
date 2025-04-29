import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import * as z from "zod"

const searchSchema = z.object({
  assetOut: z.string().optional(),
})

export const Route = createFileRoute("/_trade/trade/swap/market")({
  validateSearch: zodValidator(searchSchema),
})
