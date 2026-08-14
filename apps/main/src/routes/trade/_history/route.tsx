import { CANDLE_BUCKETS } from "@galacticcouncil/indexer/neckwork"
import { HOLLAR_ASSET_ID, SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { tradeOrderTabs } from "@/modules/trade/orders/TradeOrdersHeader"
import { TRADE_CHART_TYPES } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.utils"
import { NATIVE_ASSET_ID } from "@/utils/consts"

export const DEFAULT_TRADE_ASSET_IN_ID = HOLLAR_ASSET_ID
export const DEFAULT_TRADE_ASSET_OUT_ID = NATIVE_ASSET_ID

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
    allPairs: z.boolean().default(true),
    page: z.number().optional(),
    interval: z.enum(CANDLE_BUCKETS).default("1h").catch("1h"),
    chartType: z.enum(TRADE_CHART_TYPES).default("candles").catch("candles"),
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
