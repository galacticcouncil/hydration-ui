import {
  AggregationTimeRange,
  OmnipoolVolumeDocument,
  StablepoolVolumeDocument,
  XykVolumeDocument,
} from "./../graphql/__generated__/squid/graphql"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { isNotNil, normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { BN_0, VALID_STABLEPOOLS } from "utils/constants"
import { useIndexerUrl, useSquidUrl } from "./provider"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"
import { groupBy } from "utils/rx"
import { useOmnipoolIds, useValidXYKPoolAddresses } from "state/store"
import { useShallow } from "hooks/useShallow"
import { useEffect } from "react"
import { safeConvertAddressSS58 } from "utils/formatting"
import { useRpcProvider } from "providers/rpcProvider"

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

export type OmnipoolVolume = {
  assetId: string
  assetVolume: string
}

export type OmnipoolQuery = {
  omnipoolAssetHistoricalVolumesByPeriod: {
    nodes: {
      assetId: number
      assetVolume: string
    }[]
  }
}

export type XYKQuery = {
  xykpoolHistoricalVolumesByPeriod: {
    nodes: {
      poolId: string
      assetAId: number
      assetAVolume: string
      assetBId: number
      assetBVolume: string
    }[]
  }
}

export type StablepoolVolume = {
  poolId: string
  volumes: Array<{
    assetId: string
    assetVolume: string
  }>
}

export type StablepoolQuery = {
  stableswapHistoricalVolumesByPeriod: {
    nodes: {
      poolId: any
      assetVolumes: Array<{
        assetRegistryId: string
        swapVolume: string
      }>
    }[]
  }
}

export type XYKVolume = {
  poolId: string
  assetId: string
  assetIdB: string
  volume: string
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

export const useXYKSquidVolumes = (address?: string[], disabled?: boolean) => {
  const url = useSquidUrl()
  const { addresses: validAddresses = [] } = useValidXYKPoolAddresses()
  const queryAddresses = address ?? validAddresses

  return useQuery(
    QUERY_KEYS.xykSquidVolumes(queryAddresses),

    async () => {
      const hexAddresses = queryAddresses.map((address) =>
        u8aToHex(decodeAddress(address)),
      )

      const { xykpoolHistoricalVolumesByPeriod } = await request(
        url,
        XykVolumeDocument,
        {
          filter: {
            poolIds: hexAddresses,
            period: AggregationTimeRange["24H"],
          },
        },
      )

      return xykpoolHistoricalVolumesByPeriod.nodes
        .filter(isNotNil)
        .map((node) => ({
          poolId: safeConvertAddressSS58(node.poolId),
          assetId: node.assetAAssetRegistryId ?? node.assetAId,
          assetIdB: node.assetBAssetRegistryId ?? node.assetBId,
          volume: node.assetAVolume,
        }))
    },
    {
      enabled: !!queryAddresses.length && !disabled,
      staleTime: millisecondsInHour,
      cacheTime: millisecondsInHour,
    },
  )
}

export const useOmnipoolVolumes = (disabled?: boolean) => {
  const url = useSquidUrl()
  const ids = useOmnipoolIds(useShallow((state) => state.ids))

  return useQuery(
    QUERY_KEYS.omnipoolSquidVolumes,

    async () => {
      const { omnipoolAssetHistoricalVolumesByPeriod } = await request(
        url,
        OmnipoolVolumeDocument,
        {
          filter: { assetIds: ids, period: AggregationTimeRange["24H"] },
        },
      )

      return omnipoolAssetHistoricalVolumesByPeriod.nodes
        .filter(isNotNil)
        .map<OmnipoolVolume>((node) => ({
          assetId: node.assetRegistryId ?? node.assetId,
          assetVolume: node.assetVolume.toString(),
        }))
    },

    {
      enabled: !!ids && !disabled,
      cacheTime: millisecondsInHour,
      staleTime: millisecondsInHour,
    },
  )
}

export const useStablepoolVolumes = (disabled?: boolean) => {
  const url = useSquidUrl()

  return useQuery(
    QUERY_KEYS.stablepoolsSquidVolumes,

    async () => {
      const { stableswapHistoricalVolumesByPeriod } = await request(
        url,
        StablepoolVolumeDocument,
        {
          filter: {
            poolIds: VALID_STABLEPOOLS,
            period: AggregationTimeRange["24H"],
          },
        },
      )

      return stableswapHistoricalVolumesByPeriod.nodes
        .filter(isNotNil)
        .map((node): StablepoolVolume => {
          const volumes = node.assetVolumes.map(
            ({ assetRegistryId, swapVolume }) => ({
              assetId: assetRegistryId as string,
              assetVolume: swapVolume,
            }),
          )

          return { poolId: node.poolId, volumes }
        })
    },

    {
      enabled: !disabled,
      staleTime: millisecondsInHour,
      cacheTime: millisecondsInHour,
    },
  )
}

export const useStablepoolVolumeSubscription = () => {
  const { isLoaded, squidWSClient } = useRpcProvider()
  const queryClient = useQueryClient()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (isLoaded) {
      unsubscribe = squidWSClient.subscribe<StablepoolQuery>(
        {
          query: `
            subscription {
              stableswapHistoricalVolumesByPeriod(
                filter: {poolIds: ${JSON.stringify(VALID_STABLEPOOLS)}, period: _24H_}
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
        },
        {
          next: (data) => {
            const changedVolumes =
              data.data?.stableswapHistoricalVolumesByPeriod?.nodes.map(
                (node): StablepoolVolume => {
                  const volumes = node.assetVolumes.map(
                    ({ assetRegistryId, swapVolume }) => ({
                      assetId: assetRegistryId,
                      assetVolume: swapVolume,
                    }),
                  )

                  return { poolId: node.poolId, volumes }
                },
              )

            const prevData = queryClient.getQueryData<StablepoolVolume[]>(
              QUERY_KEYS.stablepoolsSquidVolumes,
            )

            const newData = prevData?.map((pool) => {
              const changedVolume = changedVolumes?.find(
                (changedVolume) => changedVolume.poolId === pool.poolId,
              )

              return changedVolume ?? pool
            })

            queryClient.setQueryData(
              QUERY_KEYS.stablepoolsSquidVolumes,
              newData,
            )
          },
          error: (error) => {
            console.error("error", error)
          },
          complete: () => {},
        },
      )
    }

    return () => unsubscribe?.()
  }, [queryClient, squidWSClient, isLoaded])

  return null
}

export const useXYKVolumeSubscription = () => {
  const { isLoaded, squidWSClient } = useRpcProvider()
  const queryClient = useQueryClient()

  const addresses = useValidXYKPoolAddresses(
    useShallow((state) => state.addresses),
  )

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (addresses?.length && isLoaded) {
      const hexAddresses = addresses.map((address) =>
        u8aToHex(decodeAddress(address)),
      )

      unsubscribe = squidWSClient.subscribe<XYKQuery>(
        {
          query: `
            subscription {
              xykpoolHistoricalVolumesByPeriod(
                filter: {poolIds: ${JSON.stringify(hexAddresses)}, period: _24H_}
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
        },
        {
          next: (data) => {
            const changedVolumes =
              data.data?.xykpoolHistoricalVolumesByPeriod?.nodes.map(
                (node) => ({
                  poolId: safeConvertAddressSS58(node.poolId),
                  assetId: node.assetAId.toString(),
                  assetIdB: node.assetBId.toString(),
                  volume: node.assetAVolume,
                }),
              )

            const prevData = queryClient.getQueryData<XYKVolume[]>(
              QUERY_KEYS.xykSquidVolumes(addresses),
            )

            const newData = prevData?.map((pool) => {
              const changedVolume = changedVolumes?.find(
                (changedVolume) => changedVolume.poolId === pool.poolId,
              )

              return changedVolume ?? pool
            })

            queryClient.setQueryData(
              QUERY_KEYS.xykSquidVolumes(addresses),
              newData,
            )
          },
          error: (error) => {
            console.error("error", error)
          },
          complete: () => {},
        },
      )
    }

    return () => unsubscribe?.()
  }, [addresses, queryClient, squidWSClient, isLoaded])

  return null
}
