import { useMemo } from "react"
import { useOrderData, useOrdersState } from "api/otc"
import BN from "bignumber.js"

export const useOrderTableData = () => {
  const ordersTableData = useOrderData()
  const orderIds = ordersTableData.data?.map((order) => order.id)
  const ordersState = useOrdersState(orderIds || [])
  console.log(ordersState)

  const data = useMemo(() => {
    if (!ordersTableData.data) return []
    return ordersTableData.data.map((order) => {
      const amountInDp: number = order.assetIn?.decimals?.toNumber() || 12
      const amountIn: BN = order.amountIn.shiftedBy(-1 * amountInDp)
      const amountOutDp: number = order.assetOut?.decimals?.toNumber() || 12
      const amountOut: BN = order.amountOut.shiftedBy(-1 * amountOutDp)

      return {
        id: order.id,
        owner: order.owner,
        offering: {
          amount: amountOut,
          asset: order.assetOut?.id,
          symbol: order.assetOut?.symbol,
        },
        accepting: {
          amount: amountIn,
          asset: order.assetIn?.id,
          symbol: order.assetIn?.symbol,
        },
        price: amountIn.div(amountOut),
        partiallyFillable: order.partiallyFillable,
      } as OffersTableData
    })
  }, [ordersTableData])

  return { data, isLoading: ordersTableData.isLoading }
}

export type OffersTableData = {
  id: string
  owner: string
  offering: OfferingPair
  accepting: OfferingPair
  price: BN
  filled: string
  partiallyFillable: boolean
}

export type OfferingPair = {
  amount: BN
  asset: string
  symbol: string
}
