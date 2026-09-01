import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { dcaAmountsQuery } from "@/api/grafana/dcaAmounts"
import { DcaOrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { scaleHuman } from "@/utils/formatting"

// Legacy counterpart of the neckwork `useDcaEnrichment`: chain state and the
// event indexer both know what a schedule was *asked* to trade, but not what it
// actually filled. Grafana sums the DCA.TradeExecuted amounts per schedule.
export const useDcaGrafanaEnrichment = (orders: Array<DcaOrderData>) => {
  const scheduleIds = useMemo(
    () => orders.map((order) => order.scheduleId),
    [orders],
  )

  const { data, refetch } = useQuery(dcaAmountsQuery(scheduleIds))

  const enriched = useMemo(
    () =>
      orders.map((order) => {
        const amounts = data?.get(order.scheduleId)
        if (!amounts) return order

        const executedIn = scaleHuman(amounts.spent, order.from.decimals)
        const executedOut = scaleHuman(amounts.received, order.to.decimals)

        const fromAmountExecuted = Big.max(
          order.fromAmountExecuted ?? 0,
          executedIn,
        ).toString()

        return {
          ...order,
          fromAmountExecuted,
          fromAmountRemaining:
            order.isOpenBudget || order.fromAmountBudget === null
              ? order.fromAmountRemaining
              : Big.max(
                  0,
                  Big(order.fromAmountBudget).minus(fromAmountExecuted),
                ).toString(),
          toAmountExecuted: Big(executedOut).gt(0)
            ? executedOut
            : order.toAmountExecuted,
        }
      }),
    [orders, data],
  )

  return { orders: enriched, refetch }
}
