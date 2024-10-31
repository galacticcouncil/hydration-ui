import { useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { PROVIDERS, useActiveProvider } from "./provider"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { useBestNumber } from "./chain"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"

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
    amount?: string
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

export type StableswapType = {
  name: "Stableswap.LiquidityAdded"
  id: string
  args: {
    who: string
    poolId: number
    assets: { amount: string; assetId: number }[]
    amounts: { amount: string; assetId: number }[]
  }
  block: {
    timestamp: string
  }
  extrinsic: {
    hash: string
  }
}

export const isStableswapEvent = (
  event: TradeType | StableswapType,
): event is StableswapType =>
  ["Stableswap.LiquidityAdded", "Stableswap.LiquidityRemoved"].includes(
    event.name,
  )

export const isTradeEvent = (
  event: TradeType | StableswapType,
): event is TradeType =>
  [
    "Omnipool.SellExecuted",
    "Omnipool.BuyExecuted",
    "XYK.SellExecuted",
    "XYK.BuyExecuted",
    "Router.Executed",
  ].includes(event.name)

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

export const getAllTrades =
  (indexerUrl: string, assetId?: number) => async () => {
    const after = addDays(new Date(), -1).toISOString()

    // This is being typed manually, as GraphQL schema does not
    // describe the event arguments at all
    return {
      ...(await request<{
        events: Array<TradeType | StableswapType>
      }>(
        indexerUrl,
        gql`
          query TradeVolume($assetId: Int, $after: DateTime!) {
            events(
              where: {
                OR: [
                  {
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
                  }
                  {
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
                  {
                    name_in: [
                      "Stableswap.LiquidityAdded"
                      "Stableswap.LiquidityRemoved"
                    ]
                    args_jsonContains: { poolId: $assetId }
                    phase_eq: "ApplyExtrinsic"
                    block: { timestamp_gte: $after }
                  }
                ]
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

export function useAllTrades(assetId?: number) {
  const activeProvider = useActiveProvider()
  const selectedProvider = PROVIDERS.find(
    (provider) =>
      activeProvider &&
      new URL(provider.url).hostname === new URL(activeProvider.url).hostname,
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

const squidUrl =
  "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql"
const VOLUME_BLOCK_COUNT = 7200 //24 hours

export const useXYKSquidVolumes = (addresses: string[]) => {
  const { data: bestNumber } = useBestNumber()

  return useQuery(
    QUERY_KEYS.xykSquidVolumes(addresses),
    bestNumber
      ? async () => {
          const hexAddresses = addresses.map((address) =>
            u8aToHex(decodeAddress(address)),
          )
          const startBlockNumber =
            bestNumber.parachainBlockNumber.toNumber() - VOLUME_BLOCK_COUNT

          const { xykPoolHistoricalVolumesByPeriod } = await request<{
            xykPoolHistoricalVolumesByPeriod: {
              nodes: {
                poolId: string
                assetAId: number
                assetAVolume: string
                assetBId: number
                assetBVolume: string
              }[]
            }
          }>(
            squidUrl,
            gql`
              query XykVolume($poolIds: [String!]!, $startBlockNumber: Int!) {
                xykPoolHistoricalVolumesByPeriod(
                  filter: {
                    poolIds: $poolIds
                    startBlockNumber: $startBlockNumber
                  }
                ) {
                  nodes {
                    poolId
                    assetAId
                    assetAVolume
                    assetBId
                    assetBVolume
                  }
                }
              }
            `,
            { poolIds: hexAddresses, startBlockNumber },
          )

          const { nodes = [] } = xykPoolHistoricalVolumesByPeriod

          return nodes.map((node) => ({
            poolId: encodeAddress(node.poolId, HYDRA_ADDRESS_PREFIX),
            assetId: node.assetAId.toString(),
            assetIdB: node.assetBId.toString(),
            volume: node.assetAVolume,
          }))
        }
      : undefinedNoop,
    {
      enabled: !!bestNumber && !!addresses.length,
      staleTime: millisecondsInHour,
      refetchInterval: millisecondsInMinute,
    },
  )
}
