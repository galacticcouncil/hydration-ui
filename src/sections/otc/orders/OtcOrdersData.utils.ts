import { useMemo } from "react"
import { useOrdersData, useOrdersState, getOrderStateValue } from "api/otc"
import BN from "bignumber.js"

export const useOrdersTableData = () => {
  const orders = useOrdersData()
  const orderIds = orders.data?.map((order) => order.id)
  const ordersState = useOrdersState(orderIds || [])

  const queries = [orders, ...ordersState]
  const isLoading = queries.some((q) => q.isLoading)
  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!orders.data) return []

    return orders.data.map((order) => {
      const orderState = ordersState.find(
        (state) => state.data?.orderId === parseInt(order.id),
      )
      const orderStateValue = getOrderStateValue(orderState?.data)

      const amountInDp: number = order.assetIn?.decimals?.toNumber() || 12
      const amountIn: BN = order.amountIn!.shiftedBy(-1 * amountInDp)
      const amountInInitial: string | undefined = orderStateValue?.amountIn
      const amountOutDp: number = order.assetOut?.decimals?.toNumber() || 12
      const amountOut: BN = order.amountOut!.shiftedBy(-1 * amountOutDp)
      const amountOutInitial: string | undefined = orderStateValue?.amountOut

      return {
        id: order.id,
        owner: order.owner,
        offering: {
          initial:
            amountOutInitial &&
            new BN(amountOutInitial).shiftedBy(-1 * amountOutDp),
          amount: amountOut,
          asset: order.assetOut?.id,
          symbol: order.assetOut?.symbol,
        },
        accepting: {
          initial:
            amountInInitial &&
            new BN(amountInInitial).shiftedBy(-1 * amountInDp),
          amount: amountIn,
          asset: order.assetIn?.id,
          symbol: order.assetIn?.symbol,
        },
        price: amountIn.div(amountOut),
        partiallyFillable: order.partiallyFillable,
      } as OrderTableData
    })
  }, [orders.data])

  return {
    data,
    isLoading,
    isInitialLoading,
  }
}

export type OrderTableData = {
  id: string
  owner: string
  offering: OfferingPair
  accepting: OfferingPair
  price: BN
  filled: string
  partiallyFillable: boolean
}

export type OfferingPair = {
  initial: BN | undefined
  amount: BN
  asset: string
  symbol: string
}
