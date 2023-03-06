import { useMemo } from "react"
import { useOrderData } from "api/otc"
import BN from "bignumber.js"

export const useOrderTableData = () => {
  const ordersTableData = useOrderData()

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
          amount: amountIn,
          asset: order.assetIn?.symbol,
        },
        accepting: {
          amount: amountOut,
          asset: order.assetOut?.symbol,
        },
        price: amountOut.div(amountIn),
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
}

export type OfferingPair = {
  amount: BN
  asset: string
}
