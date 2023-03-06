import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { ApiPromise } from "@polkadot/api"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAssetsTableDetails } from "./assetDetails"

export const useOrders = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.otcOrders, getOrders(api))
}

export const getOrders = (api: ApiPromise) => async () => {
  const res = await api.query.otc.orders.entries()
  const data = res.map(([key, codec]) => {
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
  })

  return data
}

export const useOrderData = () => {
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