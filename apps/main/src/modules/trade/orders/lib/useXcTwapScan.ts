import { useQuery } from "@tanstack/react-query"

import { useXcIntentsClient } from "@/api/xcIntents"
import { xcTwapTradeQuery } from "@/api/xcIntents"
import { XcScanTrade } from "@/api/xcIntents"
import { XcTwapOrderInfo } from "@/modules/trade/orders/lib/orderData"
import { getXcTwapReceived } from "@/modules/trade/orders/lib/xcTwap"
import { XcTwapScanState } from "@/modules/trade/orders/lib/xcTwapStatus"

/** Scan's trade detail (trade, orders, payouts); data is null until scan indexes it. */
export const useXcTwapTradeQuery = (xc: XcTwapOrderInfo) => {
  const client = useXcIntentsClient()
  return useQuery(xcTwapTradeQuery(client, xc.authPath))
}

/** An xc TWAP's received amount in destination units, or null until scan has it. */
export const useXcTwapReceived = (xc: XcTwapOrderInfo): string | null => {
  const { data } = useXcTwapTradeQuery(xc)

  if (!data || !xc.destination) return null

  return getXcTwapReceived(data.trade, xc.destination.decimals)
}

/** Scan's view of an xc TWAP, or null while the first read is in flight. */
export const useXcTwapScan = (
  xc: XcTwapOrderInfo,
): { state: XcTwapScanState; trade: XcScanTrade | null } | null => {
  const { data, isError } = useXcTwapTradeQuery(xc)

  if (data) return { state: data.trade.status, trade: data.trade }
  if (data === null) return { state: "notIndexed", trade: null }
  if (isError) return { state: "failed", trade: null }

  return null
}
