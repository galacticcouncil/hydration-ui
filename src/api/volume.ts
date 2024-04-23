import { useQueries, useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { Maybe, normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { PROVIDERS, useIndexerUrl, useProviderRpcUrlStore } from "./provider"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"

export type TradeType = {
  name:
    | "Omnipool.SellExecuted"
    | "Omnipool.BuyExecuted"
    | "XYK.SellExecuted"
    | "XYK.BuyExecuted"
    | "Router.Executed"
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
  extrinsic: {
    hash: string
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

export const getXYKTradeVolume =
  (indexerUrl: string, poolAddress: string) => async () => {
    const poolHex = u8aToHex(decodeAddress(poolAddress))

    const after = addDays(new Date(), -1).toISOString()

    // This is being typed manually, as GraphQL schema does not
    // describe the event arguments at all
    return {
      poolAddress: poolAddress,
      ...(await request<{
        events: Array<
          | {
              name: "XYK.SellExecuted"
              args: {
                who: string
                assetOut: number
                assetIn: number
                amount: string
                salePrice: string
                feeAsset: number
                feeAmount: string
                pool: string
              }
              block: {
                timestamp: string
              }
            }
          | {
              name: "XYK.BuyExecuted"
              args: {
                who: string
                assetOut: number
                assetIn: number
                amount: string
                buyPrice: string
                feeAsset: number
                feeAmount: string
                pool: string
              }
              block: {
                timestamp: string
              }
            }
        >
      }>(
        indexerUrl,
        gql`
          query TradeVolume($poolHex: String!, $after: DateTime!) {
            events(
              where: {
                args_jsonContains: { pool: $poolHex }
                name_in: ["XYK.SellExecuted", "XYK.BuyExecuted"]
                block: { timestamp_gte: $after }
              }
            ) {
              name
              args
              block {
                timestamp
              }
            }
          }
        `,
        { poolHex, after },
      )),
    }
  }

export const getAllTrades =
  (indexerUrl: string, assetId?: number) => async () => {
    const after = addDays(new Date(), -1).toISOString()

    // This is being typed manually, as GraphQL schema does not
    // describe the event arguments at all
    return {
      ...(await request<{
        events: Array<TradeType>
      }>(
        indexerUrl,
        gql`
          query TradeVolume($assetId: Int, $after: DateTime!) {
            events(
              where: {
                name_in: [
                  "Omnipool.SellExecuted"
                  "Omnipool.BuyExecuted"
                  "XYK.SellExecuted"
                  "XYK.BuyExecuted"
                  "Router.Executed"
                ]
                args_jsonContains: { assetIn: $assetId }
                phase_eq: "ApplyExtrinsic"
                block: { timestamp_gte: $after }
                OR: {
                  name_in: [
                    "Omnipool.SellExecuted"
                    "Omnipool.BuyExecuted"
                    "XYK.SellExecuted"
                    "XYK.BuyExecuted"
                    "Router.Executed"
                  ]
                  args_jsonContains: { assetOut: $assetId }
                  phase_eq: "ApplyExtrinsic"
                  block: { timestamp_gte: $after }
                }
              }
              orderBy: [block_height_DESC, pos_ASC]
              limit: 100
            ) {
              id
              name
              args
              block {
                timestamp
              }
              extrinsic {
                hash
              }
            }
          }
        `,
        { after, assetId },
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

export function useXYKTradeVolumes(assetIds: Maybe<u32 | string>[]) {
  const indexerUrl = useIndexerUrl()

  return useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: QUERY_KEYS.xykTradeVolume(assetId),
      queryFn:
        assetId != null
          ? getXYKTradeVolume(indexerUrl, assetId.toString())
          : undefinedNoop,
      enabled: !!assetId,
      refetchInterval: 30000,
    })),
  })
}

export function useAllTrades(assetId?: number) {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find(
    (provider) => new URL(provider.url).hostname === new URL(rpcUrl).hostname,
  )

  const indexerUrl =
    selectedProvider?.indexerUrl ?? import.meta.env.VITE_INDEXER_URL
  return useQuery(
    QUERY_KEYS.allTrades(assetId),
    getAllTrades(indexerUrl, assetId),
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

export function getXYKVolumeAssetTotalValue(
  volume?: Awaited<ReturnType<ReturnType<typeof getXYKTradeVolume>>>,
) {
  if (!volume) return

  return (
    volume.events.reduce<Record<string, BN>>((memo, item) => {
      const assetIn = item.args.assetIn.toString()
      const assetOut = item.args.assetOut.toString()

      const amount = item.args.amount

      if (memo[assetIn] == null) memo[assetIn] = BN_0

      if (item.name === "XYK.BuyExecuted") {
        if (memo[assetOut]) {
          memo[assetOut] = memo[assetOut].plus(amount)
        } else {
          memo[assetOut] = BN(amount)
        }
      }

      if (item.name === "XYK.SellExecuted") {
        if (memo[assetIn]) {
          memo[assetIn] = memo[assetIn].plus(amount)
        } else {
          memo[assetIn] = BN(amount)
        }
      }

      return memo
    }, {}) ?? {}
  )
}

export const useVolume = (assetId?: string | "all") => {
  return useQuery(
    QUERY_KEYS.volumeDaily(assetId),
    assetId
      ? async () => {
          const data = await getVolumeDaily(
            assetId === "all" ? undefined : assetId,
          )
          return data
        }
      : undefinedNoop,
    { enabled: !!assetId },
  )
}

const getVolumeDaily = async (assetId?: string) => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v2/stats/volume${
      assetId !== undefined ? `/${assetId}` : ""
    }`,
  )
  const data: Promise<{ volume_usd: number; asset_id: number }[]> = res.json()

  return data
}
