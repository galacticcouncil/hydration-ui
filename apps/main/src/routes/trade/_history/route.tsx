import { HYDRATION_CHAIN_KEY, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { tradeOrderTabs } from "@/modules/trade/orders/TradeOrders/TradeOrdersHeader"
import {
  DEFAULT_TRADE_ASSET_IN_ID,
  DEFAULT_TRADE_ASSET_OUT_ID,
} from "@/modules/trade/swap/lib/swapTabSearch"
import { isHydrationAssetId, XC_PLATFORMS } from "@/utils/trade"

const searchSchema = z
  .object({
    tab: z.enum(tradeOrderTabs).default("myActivity"),
    assetIn: z
      .string()
      .default(DEFAULT_TRADE_ASSET_IN_ID)
      .catch(DEFAULT_TRADE_ASSET_IN_ID),
    assetOut: z
      .string()
      .default(DEFAULT_TRADE_ASSET_OUT_ID)
      .catch(DEFAULT_TRADE_ASSET_OUT_ID),
    destPlatform: z
      .enum(XC_PLATFORMS)
      .default(HYDRATION_CHAIN_KEY)
      .catch(HYDRATION_CHAIN_KEY),
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
        destPlatform: HYDRATION_CHAIN_KEY,
      }
    }

    if (
      isHydrationAssetId(search.assetOut) &&
      search.destPlatform !== HYDRATION_CHAIN_KEY
    ) {
      return {
        ...search,
        destPlatform: HYDRATION_CHAIN_KEY,
      }
    }

    return search
  })

export type TradeHistorySearchParams = z.infer<typeof searchSchema>

export const Route = createFileRoute("/trade/_history")({
  validateSearch: searchSchema,
})
