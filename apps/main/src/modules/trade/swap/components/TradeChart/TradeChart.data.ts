import { useQuery } from "@tanstack/react-query"

import { DATA } from "@/modules/trade/swap/_mock"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export enum TradeChartIntervalType {
  All = "all",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
}

type Args = {
  readonly assetIn: string
  readonly assetOut: string
  readonly interval: TradeChartIntervalType
}

export const useTradeChartData = ({ assetIn, assetOut, interval }: Args) => {
  return useQuery({
    // Fetch mock data until we have real data
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "chart",
      assetIn,
      assetOut,
      interval,
    ],
    queryFn: mockFetch,
    retry: 0,
  })
}

async function mockFetch() {
  const shouldError = false
  return new Promise<typeof DATA>((resolve, reject) => {
    setTimeout(() => {
      if (shouldError) {
        reject(new Error("Failed to fetch data"))
      } else {
        resolve(DATA)
      }
    }, 1000)
  })
}
