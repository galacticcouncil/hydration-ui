import { u8aToHex } from "@polkadot/util"
import { decodeAddress } from "@polkadot/util-crypto"
import { useQuery } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { request, gql } from "graphql-request"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe } from "utils/types"

const getTradeVolume = (poolAddress: string) => async () => {
  const poolHex = u8aToHex(decodeAddress(poolAddress))
  const after = addDays(new Date(), -1).toISOString()

  // This is being typed manually, as GraphQL schema does not
  // describe the event arguments at all
  return await request<{
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
        }
    >
  }>(
    import.meta.env.VITE_INDEXER_URL,
    gql`
      query TradeVolume($poolHex: String!, $after: DateTime!) {
        events(
          where: {
            args_jsonContains: { pool: $poolHex }
            block: { timestamp_gte: $after }
            AND: {
              name_eq: "XYK.SellExecuted"
              OR: { name_eq: "XYK.BuyExecuted" }
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
    { poolHex, after },
  )
}

export function useTradeVolume(poolAddress: Maybe<string>) {
  return useQuery(
    QUERY_KEYS.tradeVolume(poolAddress),
    poolAddress != null ? getTradeVolume(poolAddress) : undefinedNoop,
    { enabled: !!poolAddress },
  )
}
