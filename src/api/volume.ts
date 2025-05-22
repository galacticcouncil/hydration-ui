import { useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"
import { useIndexerUrl, useSquidUrl } from "./provider"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"
import { useRpcProvider } from "providers/rpcProvider"
import { groupBy } from "utils/rx"
import { safeConvertAddressSS58 } from "utils/formatting"

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
    const { events } = {
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

    const groupedEvents = groupBy(events, ({ extrinsic }) => extrinsic.hash)

    const data = Object.entries(groupedEvents).map(([, value]) => {
      const routerEvent = value.find(({ name }) => name === "Router.Executed")
      const tradeEvents = value.filter(isTradeEvent)
      const stableswapEvents = value.filter(isStableswapEvent)
      const [firstEvent] = tradeEvents

      if (!tradeEvents.length) return null

      if (firstEvent?.name === "Router.Executed") {
        const who = stableswapEvents?.[0]?.args?.who
        if (!who) return null
        return {
          value,
          ...firstEvent,
          args: {
            who: stableswapEvents[0].args.who,
            assetIn: firstEvent.args.assetIn,
            assetOut: firstEvent.args.assetOut,
            amountIn: firstEvent.args.amountIn,
            amountOut: firstEvent.args.amountOut,
          },
        }
      }

      let event: TradeType
      if (!routerEvent) {
        const lastEvent = tradeEvents[tradeEvents.length - 1]
        const assetIn = firstEvent.args.assetIn
        const assetOut = lastEvent.args.assetOut

        const stableswapIn = stableswapEvents.find(
          ({ args }) => args.poolId === assetIn,
        )
        const stableswapAssetIn = stableswapIn?.args?.assets?.[0]?.assetId
        const stableswapAmountIn = stableswapIn?.args?.assets?.[0]?.amount

        const stableswapOut = stableswapEvents.find(
          ({ args }) => args.poolId === assetOut,
        )
        const stableswapAssetOut = stableswapOut?.args?.amounts?.[0]?.assetId
        const stableswapAmountOut = stableswapIn?.args?.amounts?.[0]?.amount

        event = {
          ...firstEvent,
          args: {
            who: firstEvent.args.who,
            assetIn: stableswapAssetIn || assetIn,
            assetOut: stableswapAssetOut || assetOut,
            amountIn:
              stableswapAmountIn ||
              firstEvent.args.amount ||
              firstEvent.args.amountIn,
            amountOut:
              stableswapAmountOut ||
              lastEvent.args.amount ||
              lastEvent.args.amountOut,
          },
        }
      } else {
        event = {
          ...firstEvent,
          args: {
            ...firstEvent.args,
            ...routerEvent.args,
          },
        }
      }

      return event
    })

    return data
  }

export function useAllTrades(assetId?: number) {
  const indexerUrl = useIndexerUrl()

  return useQuery(
    QUERY_KEYS.allTrades(assetId),
    getAllTrades(indexerUrl, assetId),
    { staleTime: millisecondsInMinute },
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
    { enabled: !!assetId, refetchInterval: millisecondsInMinute },
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

const VOLUME_BLOCK_COUNT = 7200 //24 hours

export const useXYKSquidVolumes = (addresses: string[]) => {
  const { api, isLoaded } = useRpcProvider()
  const url =
    "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql"

  return useQuery(
    QUERY_KEYS.xykSquidVolumes(addresses),

    async () => {
      const hexAddresses = addresses.map((address) =>
        u8aToHex(decodeAddress(address)),
      )

      const endBlockNumber = (await api.derive.chain.bestNumber()).toNumber()
      const startBlockNumber = endBlockNumber - VOLUME_BLOCK_COUNT

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
        url,
        gql`
          query XykVolume(
            $poolIds: [String!]!
            $startBlockNumber: Int!
            $endBlockNumber: Int!
          ) {
            xykPoolHistoricalVolumesByPeriod(
              filter: {
                poolIds: $poolIds
                startBlockNumber: $startBlockNumber
                endBlockNumber: $endBlockNumber
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
        { poolIds: hexAddresses, startBlockNumber, endBlockNumber },
      )

      const { nodes = [] } = xykPoolHistoricalVolumesByPeriod

      return nodes.map((node) => ({
        poolId: safeConvertAddressSS58(node.poolId),
        assetId: node.assetAId.toString(),
        assetIdB: node.assetBId.toString(),
        volume: node.assetAVolume,
      }))
    },
    {
      enabled: isLoaded && !!addresses.length,
      staleTime: millisecondsInHour,
      refetchInterval: millisecondsInMinute,
    },
  )
}

const omnipoolAddress =
  "0x6d6f646c6f6d6e69706f6f6c0000000000000000000000000000000000000000"

export const useOmnipoolVolumes = (ids: string[]) => {
  const { api, isLoaded } = useRpcProvider()
  const url =
    "https://galacticcouncil.squids.live/hydration-pools:prod/api/graphql"

  return useQuery(
    QUERY_KEYS.omnipoolSquidVolumes(ids),

    async () => {
      const endBlockNumber = (await api.derive.chain.bestNumber()).toNumber()
      const omnipoolIds = ids.map((id) => `${omnipoolAddress}-${id}`)

      const startBlockNumber = endBlockNumber - VOLUME_BLOCK_COUNT

      const { omnipoolAssetHistoricalVolumesByPeriod } = await request<{
        omnipoolAssetHistoricalVolumesByPeriod: {
          nodes: {
            assetId: number
            assetVolume: string
          }[]
        }
      }>(
        url,
        gql`
          query OmnipoolVolume(
            $omnipoolAssetIds: [String!]!
            $startBlockNumber: Int!
            $endBlockNumber: Int!
          ) {
            omnipoolAssetHistoricalVolumesByPeriod(
              filter: {
                omnipoolAssetIds: $omnipoolAssetIds
                startBlockNumber: $startBlockNumber
                endBlockNumber: $endBlockNumber
              }
            ) {
              nodes {
                assetId
                assetVolume
              }
            }
          }
        `,
        { omnipoolAssetIds: omnipoolIds, startBlockNumber, endBlockNumber },
      )

      const { nodes = [] } = omnipoolAssetHistoricalVolumesByPeriod

      return nodes.map((node) => ({
        assetId: node.assetId.toString(),
        assetVolume: node.assetVolume.toString(),
      }))
    },

    {
      enabled: isLoaded && !!ids.length,
      staleTime: millisecondsInHour,
    },
  )
}

export const useStablepoolVolumes = (ids: string[]) => {
  const url = useSquidUrl()

  return useQuery(
    QUERY_KEYS.stablepoolsSquidVolumes(ids),

    async () => {
      const { stableswapHistoricalVolumesByPeriod } = await request<{
        stableswapHistoricalVolumesByPeriod: {
          nodes: {
            poolId: any
            assetVolumes: Array<{
              assetRegistryId: string
              swapVolume: string
            }>
          }[]
        }
      }>(
        url,
        gql`
          query StablepoolVolume($poolIds: [String!]!) {
            stableswapHistoricalVolumesByPeriod(
              filter: { poolIds: $poolIds, period: _24H_ }
            ) {
              nodes {
                poolId
                assetVolumes {
                  assetRegistryId
                  swapVolume
                }
              }
            }
          }
        `,
        { poolIds: ids },
      )

      const { nodes = [] } = stableswapHistoricalVolumesByPeriod

      return nodes.map((node) => {
        const volumes = node.assetVolumes.map(
          ({ assetRegistryId, swapVolume }) => ({
            assetId: assetRegistryId,
            assetVolume: swapVolume,
          }),
        )

        return { poolId: node.poolId, volumes }
      })
    },

    {
      enabled: !!ids.length,
      staleTime: millisecondsInHour,
    },
  )
}
