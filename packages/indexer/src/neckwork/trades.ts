import { queryOptions } from "@tanstack/react-query"

import { NECKWORK_ACCOUNT_KEY, NECKWORK_STALE_TIME, NeckworkClient } from "."

export type RoutedTrade = {
  blockHeight: number
  eventIndex: number
  extrinsicIndex: number | null
  /** ms epoch */
  timestamp: number
  assetIn: string
  /** raw on-chain integer */
  amountIn: string
  assetOut: string
  /** raw on-chain integer */
  amountOut: string
}

type RoutedTradesArgs = {
  account: string
  assetIds: string[]
  page: number
  pageSize: number
}

export const routedTradesQuery = (
  client: NeckworkClient,
  { account, assetIds, page, pageSize }: RoutedTradesArgs,
) =>
  queryOptions({
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "routedTrades",
      account,
      assetIds,
      page,
      pageSize,
    ],
    staleTime: NECKWORK_STALE_TIME,
    enabled: !!account,
    queryFn: async (): Promise<{
      items: RoutedTrade[]
      totalCount: number
    }> => {
      const { data } = await client.GET("/v1/trades/routed", {
        params: {
          query: {
            participant: account,
            limit: pageSize,
            offset: page * pageSize,
            ...(assetIds.length ? { assets: assetIds.join(",") } : {}),
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no routed trades")

      return {
        items: Array.from(data.items).map((item) => ({
          blockHeight: item.blockHeight,
          eventIndex: item.eventIndex,
          extrinsicIndex: item.extrinsicIndex,
          timestamp: new Date(item.timestamp).getTime(),
          assetIn: item.assetIn,
          amountIn: item.amountIn,
          assetOut: item.assetOut,
          amountOut: item.amountOut,
        })),
        totalCount: data.totalCount,
      }
    },
  })
