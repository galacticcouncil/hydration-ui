import { SELL_ONLY_ASSETS, USDT_ASSET_ID } from "@galacticcouncil/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { tradeOrderTabs } from "@/modules/trade/orders/TradeOrdersHeader"
import { NATIVE_ASSET_ID } from "@/utils/consts"

const searchSchema = z
  .object({
    tab: z.enum(tradeOrderTabs).default("myActivity"),
    assetIn: z.string().default(USDT_ASSET_ID),
    assetOut: z.string().default(NATIVE_ASSET_ID),
    allPairs: z.boolean().default(false),
  })
  .overwrite((search) => {
    if (
      search.assetIn === search.assetOut ||
      SELL_ONLY_ASSETS.includes(search.assetOut)
    ) {
      return {
        ...search,
        assetIn: USDT_ASSET_ID,
        assetOut: NATIVE_ASSET_ID,
      }
    }

    return search
  })

export type TradeHistorySearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute("/trade/_history")({
  validateSearch: searchSchema,
})
