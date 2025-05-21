import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod"

import { tradeOrderTabs } from "@/modules/trade/orders/TradeOrdersHeader"
import { NATIVE_ASSET_ID, USDT_ASSET_ID } from "@/utils/consts"

const searchSchema = z.object({
  tab: z.enum(tradeOrderTabs).default("myActivity"),
  assetIn: z.string().default(USDT_ASSET_ID),
  assetOut: z.string().default(NATIVE_ASSET_ID),
  allPairs: z.boolean().default(false),
})

export const Route = createFileRoute("/trade/_history")({
  validateSearch: searchSchema,
})
