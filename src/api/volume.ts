import { useQueries, useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { Maybe, normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { PROVIDERS, useIndexerUrl, useProviderRpcUrlStore } from "./provider"
import { useCallback } from "react"

export type TradeType = {
  name: "Omnipool.SellExecuted" | "Omnipool.BuyExecuted" | "OTC.Placed"
  id: string
  args: {
    who: string
    assetIn: number
    assetOut: number
    amountIn: string
    amountOut: string
  }
  block: {
    timestamp: string
  }
}

export const getTradeVolume =
  (indexerUrl: string, assetId: string) => async () => {
    const assetIn = Number(assetId)
    const after = addDays(new Date(), -1).toISOString()

    // This is being typed manually, as GraphQL schema does not
    // describe the event arguments at all
    return {
      assetId: normalizeId(assetId),
      ...(await request<{
        events: Array<TradeType>
      }>(
        indexerUrl,
        gql`
          query TradeVolume($assetIn: Int!, $after: DateTime!) {
            events(
              where: {
                args_jsonContains: { assetIn: $assetIn }
                block: { timestamp_gte: $after }
                OR: {
                  args_jsonContains: { assetOut: $assetIn }
                  block: { timestamp_gte: $after }
                }
                AND: {
                  name_eq: "Omnipool.SellExecuted"
                  OR: { name_eq: "Omnipool.BuyExecuted" }
                }
              }
            ) {
              id
              name
              args
              block {
                timestamp
              }
            }
          }
        `,
        { assetIn, after },
      )),
    }
  }

export const getAllOmnipoolTrades = (indexerUrl: string) => async () => {
  const after = addDays(new Date(), -1).toISOString()

  // This is being typed manually, as GraphQL schema does not
  // describe the event arguments at all
  return {
    ...(await request<{
      events: Array<TradeType>
    }>(
      indexerUrl,
      gql`
        query TradeVolume($after: DateTime!) {
          events(
            where: {
              name_contains: "Omnipool.SellExecuted"
              block: { timestamp_gte: $after }
              OR: {
                name_contains: "Omnipool.BuyExecuted"
                block: { timestamp_gte: $after }
              }
            }
          ) {
            id
            name
            args
            block {
              timestamp
            }
          }
        }
      `,
      { after },
    )),
  }
}

export const getAllStableswapTrades = (indexerUrl: string) => async () => {
  const after = addDays(new Date(), -1).toISOString()

  // This is being typed manually, as GraphQL schema does not
  // describe the event arguments at all
  return {
    ...(await request<{
      events: Array<TradeType>
    }>(
      indexerUrl,
      gql`
        query TradeVolume($after: DateTime!) {
          events(
            where: {
              name_eq: "Stableswap.SellExecuted"
              block: { timestamp_gte: $after }
              OR: {
                name_eq: "Stableswap.BuyExecuted"
                block: { timestamp_gte: $after }
              }
            }
          ) {
            id
            name
            args
            block {
              timestamp
            }
          }
        }
      `,
      { after },
    )),
  }
}

export function useTradeVolumes(
  assetIds: Maybe<u32 | string>[],
  noRefresh?: boolean,
) {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find(
    (provider) => new URL(provider.url).hostname === new URL(rpcUrl).hostname,
  )

  const indexerUrl =
    selectedProvider?.indexerUrl ?? import.meta.env.VITE_INDEXER_URL

  return useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: noRefresh
        ? QUERY_KEYS.tradeVolume(assetId)
        : QUERY_KEYS.tradeVolumeLive(assetId),
      queryFn:
        assetId != null
          ? getTradeVolume(indexerUrl, assetId.toString())
          : undefinedNoop,
      enabled: !!assetId,
    })),
  })
}

export const useAllTradesSorted = () => {
  const indexerUrl = useIndexerUrl()

  return useQuery(
    QUERY_KEYS.allOmnipoolTrades,
    getAllOmnipoolTrades(indexerUrl),
    {
      select: useCallback((data: { events: TradeType[] }) => {
        return data.events.reduce<Record<string, TradeType[]>>((acc, event) => {
          acc[event.args.assetIn]
            ? acc[event.args.assetIn].push(event)
            : (acc[event.args.assetIn] = [event])
          acc[event.args.assetOut]
            ? acc[event.args.assetOut].push(event)
            : (acc[event.args.assetOut] = [event])

          return acc
        }, {})
      }, []),
      refetchInterval: 60000,
    },
  )
}

export function useAllOmnipoolTrades() {
  const indexerUrl = useIndexerUrl()

  return useQuery(
    QUERY_KEYS.allOmnipoolTrades,
    getAllOmnipoolTrades(indexerUrl),
  )
}

export function useAllStableswapTrades() {
  const indexerUrl = useIndexerUrl()

  return useQuery(
    QUERY_KEYS.allStableswapTrades,
    getAllStableswapTrades(indexerUrl),
    {
      select: useCallback((data: { events: TradeType[] }) => {
        return data.events.reduce<Record<string, TradeType[]>>((acc, event) => {
          acc[event.args.assetIn]
            ? acc[event.args.assetIn].push(event)
            : (acc[event.args.assetIn] = [event])

          return acc
        }, {})
      }, []),
      refetchInterval: 60000,
    },
  )
}

export function getVolumeAssetTotalValue(
  volume?: Awaited<ReturnType<ReturnType<typeof getTradeVolume>>>,
) {
  if (!volume) return
  // Assuming trade volume is the aggregate amount being
  // sent between user account and pair account

  return (
    volume.events.reduce<Record<string, BN>>((memo, item) => {
      const assetIn = item.args.assetIn.toString()
      const assetOut = item.args.assetOut.toString()
      const amountIn = new BN(item.args.amountIn)
      const amountOut = new BN(item.args.amountOut)
      if (memo[assetIn] == null) memo[assetIn] = BN_0
      if (memo[assetOut] == null) memo[assetOut] = BN_0

      if (item.name === "Omnipool.BuyExecuted") {
        memo[assetIn] = memo[assetIn].plus(amountIn)
        memo[assetOut] = memo[assetOut].plus(amountOut)
      }

      if (item.name === "Omnipool.SellExecuted") {
        memo[assetIn] = memo[assetIn].plus(amountIn)
        memo[assetOut] = memo[assetOut].plus(amountOut)
      }

      return memo
    }, {}) ?? {}
  )
}

export const useVolume = (assetId?: string) => {
  return useQuery(QUERY_KEYS.volumeDaily(assetId), async () => {
    const data = await getVolumeDaily(assetId)
    return { volume: BN(data[0].volume_usd), assetId }
  })
}

export const useVolumes = (assetIds: string[]) => {
  return useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: QUERY_KEYS.volumeDaily(assetId),
      queryFn:
        assetId != null
          ? async () => {
              const data = await getVolumeDaily(assetId)
              return { volume: BN(data[0].volume_usd), assetId }
            }
          : undefinedNoop,
      enabled: !!assetId,
    })),
  })
}

const getVolumeDaily = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/volume${
      assetId != null ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<{ volume_usd: number }[]> = res.json()

  return data
}
