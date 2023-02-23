import { useQueries, useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { Maybe, normalizeId, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"
import BN from "bignumber.js"
import { BN_0 } from "../utils/constants"

export const getTradeVolume = async (assetId: u32) => {
  const assetIn = assetId.toNumber()
  const after = addDays(new Date(), -1).toISOString()

  // This is being typed manually, as GraphQL schema does not
  // describe the event arguments at all
  return await request<{
    events: Array<
      | {
          name: "Omnipool.SellExecuted"
          args: {
            who: string
            assetIn: number
            assetOut: number
            amountIn: string
            amountOut: string
          }
        }
      | {
          name: "Omnipool.BuyExecuted"
          args: {
            who: string
            assetIn: number
            assetOut: number
            amountIn: string
            amountOut: string
          }
        }
    >
  }>(
    import.meta.env.VITE_INDEXER_URL,
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
          name
          args
          block {
            timestamp
          }
        }
      }
    `,
    { assetIn, after },
  )
}

export function useTradeVolume(assetId: Maybe<u32>) {
  return useQuery(
    QUERY_KEYS.tradeVolume(assetId),
    assetId != null ? async () => getTradeVolume(assetId) : undefinedNoop,
    { enabled: !!assetId },
  )
}

export function useTradeVolumes(assetIds: Maybe<u32>[]) {
  return useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: QUERY_KEYS.tradeVolume(assetId),
      queryFn:
        assetId != null
          ? async () => {
              const volume = await getTradeVolume(assetId)
              return {
                assetId: normalizeId(assetId),
                ...volume,
              }
            }
          : undefinedNoop,
      enabled: !!assetId,
    })),
  })
}

export function getVolumeAssetTotalValue(
  volume: Awaited<ReturnType<typeof getTradeVolume>>,
) {
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
