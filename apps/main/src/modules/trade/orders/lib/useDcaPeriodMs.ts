import { useBlockTime } from "@/api/chain"
import {
  getDcaTradeProgress,
  useDcaFundingBalance,
} from "@/modules/trade/orders/lib/dcaProgress"
import { OrderData, OrderStatus } from "@/modules/trade/orders/lib/orderData"

export const useDcaPeriodMs = (order: OrderData | undefined): number | null => {
  const { data: blockTimeMs } = useBlockTime()
  const isOpenBudget = !!order && "isOpenBudget" in order && order.isOpenBudget
  const fundingBalance = useDcaFundingBalance(order?.from, isOpenBudget)

  if (!order || !blockTimeMs) return null
  if (order.status !== OrderStatus.Created) return null
  if (!("blocksPeriod" in order) || !order.blocksPeriod) return null

  const progress = getDcaTradeProgress({
    sold: order.fromAmountExecuted,
    total: order.fromAmountBudget,
    singleTradeSize: order.singleTradeSize,
    isOpenBudget,
    fundingBalance,
  })

  // A null progress means the terms were never recorded (pre-router schedule),
  // not that the order is done - only a real count of zero hides the estimate.
  if (progress && progress.remaining <= 0) return null

  const periodMs = Number(order.blocksPeriod) * blockTimeMs

  return Number.isFinite(periodMs) && periodMs > 0 ? periodMs : null
}
