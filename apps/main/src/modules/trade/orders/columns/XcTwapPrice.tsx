import Big from "big.js"
import { FC } from "react"

import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import {
  getOrderDestination,
  OrderData,
  XcTwapOrderInfo,
} from "@/modules/trade/orders/lib/orderData"
import { useXcTwapReceived } from "@/modules/trade/orders/lib/useXcTwapScan"

type XcTwapPriceProps = {
  readonly order: OrderData
  readonly xc: XcTwapOrderInfo
}

export const XcTwapPrice: FC<XcTwapPriceProps> = ({ order, xc }) => {
  const received = useXcTwapReceived(xc)
  const sold = order.fromAmountExecuted

  const averagePrice =
    sold && received && Big(sold).gt(0) && Big(received).gt(0)
      ? Big(sold).div(received).toString()
      : null

  return (
    <SwapPrice
      from={order.from}
      to={getOrderDestination(order)}
      price={averagePrice}
    />
  )
}
