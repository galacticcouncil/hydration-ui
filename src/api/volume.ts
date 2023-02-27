import { useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { gql, request } from "graphql-request"
import { Maybe, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"

export const getTradeVolume = (assetId: u32) => async () => {
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
    assetId != null ? getTradeVolume(assetId) : undefinedNoop,
    { enabled: !!assetId },
  )
}
