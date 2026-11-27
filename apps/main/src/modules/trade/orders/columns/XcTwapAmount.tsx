import { FC } from "react"

import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import {
  getOrderDestination,
  OrderData,
  XcTwapOrderInfo,
} from "@/modules/trade/orders/lib/orderData"
import { useXcTwapReceived } from "@/modules/trade/orders/lib/useXcTwapScan"

type XcTwapAmountProps = {
  readonly order: OrderData
  readonly xc: XcTwapOrderInfo
  /** Budget on Open orders, sold so far in Order history */
  readonly fromAmount: string | null
}

export const XcTwapAmount: FC<XcTwapAmountProps> = ({
  order,
  xc,
  fromAmount,
}) => {
  const received = useXcTwapReceived(xc)

  return (
    <SwapAmount
      fromAmount={fromAmount}
      from={order.from}
      toAmount={received}
      to={getOrderDestination(order)}
      showLogo
    />
  )
}
