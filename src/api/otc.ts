import { useApiPromise } from "utils/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAssetsTableDetails } from "./assetDetails"
import { gql, request } from "graphql-request"
import { Maybe, undefinedNoop } from "utils/helpers"

export const getOrders = (api: ApiPromise) => async () => {
  const res = await api.query.otc.orders.entries()
  const data = res.map(([key, codec]) => {
    if (!codec.isEmpty) {
      const data = codec.unwrap()
      return {
        id: key.args[0].toString(),
        owner: data.owner.toString(),
        assetIn: data.assetIn.toString(),
        assetOut: data.assetOut.toString(),
        amountIn: data.amountIn.toBigNumber(),
        amountOut: data.amountOut.toBigNumber(),
        partiallyFillable: data.partiallyFillable.toPrimitive(),
      }
    }
    return {
      id: key.args[0].toString(),
    }
  })
  return data
}

export const useOrders = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.otcOrders, getOrders(api))
}

export const useOrdersData = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.otcOrdersTable, async () => {
    const orders = await getOrders(api)()
    const allAssets = await getAssetsTableDetails(api)()

    return orders.map((order) => {
      return {
        ...order,
        assetIn: allAssets.find((ass) => order.assetIn === ass?.id)!,
        assetOut: allAssets.find((ass) => order.assetOut === ass?.id)!,
      }
    })
  })
}

export const getOrdersState = (orderId: number) => async () => {
  return {
    orderId: orderId,
    ...(await request<{
      events: Array<{
        name: "OTC.Placed"
        args: {
          orderId: number
          assetIn: number
          assetOut: number
          amountIn: string
          amountOut: string
          partiallyFillable: boolean
        }
      }>
    }>(
      import.meta.env.VITE_INDEXER_URL,
      gql`
        query OrdersState($orderId: Int!) {
          events(
            where: {
              args_jsonContains: { orderId: $orderId }
              AND: { name_eq: "OTC.Placed" }
            }
          ) {
            name
            args
          }
        }
      `,
      { orderId },
    )),
  }
}

export function useOrdersState(orderIds: Maybe<string>[]) {
  return useQueries({
    queries: orderIds.map((orderId) => ({
      queryKey: QUERY_KEYS.otcOrderState(orderId),
      queryFn:
        orderId != null ? getOrdersState(parseInt(orderId)) : undefinedNoop,
      enabled: !!orderId,
    })),
  })
}
