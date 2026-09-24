import { queryOptions } from "@tanstack/react-query"

import {
  NECKWORK_ACCOUNT_KEY,
  NECKWORK_BASE_STALE_TIME,
  NeckworkClient,
  NeckworkResponse,
  WithEpoch,
  withEpoch,
} from "."

export type RoutedTrade = WithEpoch<
  NeckworkResponse<"/v1/trades/routed">["items"][number]
>

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
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!account,
    queryFn: async (): Promise<{
      items: readonly RoutedTrade[]
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

      return { items: data.items.map(withEpoch), totalCount: data.totalCount }
    },
  })

export type MarketTrade = WithEpoch<
  NeckworkResponse<"/v1/trades">["items"][number]
>

type MarketTradesArgs = {
  assetIds: string[]
  limit: number
  offset: number
}

/**
 * Global market trades feed. The query omits `swapper` because the API serves
 * the global feed only when no account is named.
 */
export const marketTradesQuery = (
  client: NeckworkClient,
  { assetIds, limit, offset }: MarketTradesArgs,
) =>
  queryOptions({
    queryKey: ["neckwork", "marketTrades", assetIds, limit, offset],
    staleTime: NECKWORK_BASE_STALE_TIME,
    queryFn: async (): Promise<{
      items: readonly MarketTrade[]
      totalCount: number
    }> => {
      const { data } = await client.GET("/v1/trades", {
        params: {
          query: {
            limit,
            offset,
            ...(assetIds.length ? { assets: assetIds.join(",") } : {}),
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no market trades")

      return { items: data.items.map(withEpoch), totalCount: data.totalCount }
    },
  })
