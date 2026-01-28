import { HOLLAR_ASSET_ID, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { tradeOrderTabs } from "@/modules/trade/orders/TradeOrdersHeader"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export const DEFAULT_TRADE_ASSET_IN_ID = HOLLAR_ASSET_ID
export const DEFAULT_TRADE_ASSET_OUT_ID = NATIVE_ASSET_ID

const searchSchema = z
  .object({
    tab: z.enum(tradeOrderTabs).default("myActivity"),
    assetIn: z.string().default(HOLLAR_ASSET_ID),
    assetOut: z.string().default(NATIVE_ASSET_ID),
    allPairs: z.boolean().default(true),
    page: z.number().optional(),
  })
  .overwrite((search) => {
    if (
      search.assetIn === search.assetOut ||
      SELL_ONLY_ASSETS.includes(search.assetOut)
    ) {
      return {
        ...search,
        assetIn: DEFAULT_TRADE_ASSET_IN_ID,
        assetOut: DEFAULT_TRADE_ASSET_OUT_ID,
      }
    }

    return search
  })

export type TradeHistorySearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute("/trade/_history")({
  validateSearch: searchSchema,
})
