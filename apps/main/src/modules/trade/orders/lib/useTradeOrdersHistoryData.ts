import {
  ordersStatusQuery,
  scheduledOrdersQuery,
} from "@galacticcouncil/indexer/indexer"
import { findNested, safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { useIndexerClient } from "@/api/provider"
import {
  TradeOrderHistoryItem,
  TradeOrderHistoryStatus,
} from "@/modules/trade/orders/lib/tradeOrdersHistory.types"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type ScheduledEventArgs = {
  id: number
}

type ScheduledOrderArgs = {
  assetIn: number
  assetOut: number
  amountIn?: string
  maxAmountIn?: string
}

type ScheduleArgs = {
  order: ScheduledOrderArgs
  period: number
  totalAmount: string
}

type ScheduledCallArgs = {
  schedule?: ScheduleArgs
}

type StatusEventArgs = {
  id: number
  error?: string
}

export const useTradeOrdersHistoryData = () => {
  const { account } = useAccount()
  const who = safeConvertSS58toPublicKey(account?.address ?? "")

  const indexerSdk = useIndexerClient()

  const { data: scheduledData, isLoading: isScheduledLoading } = useQuery(
    scheduledOrdersQuery(indexerSdk, who),
  )
  const { data: statusData, isLoading: isStatusLoading } = useQuery(
    ordersStatusQuery(indexerSdk, who),
  )

  const { getAssetWithFallback } = useAssets()

  const orders = useMemo<Array<TradeOrderHistoryItem>>(() => {
    const statusMap = new Map<number, TradeOrderHistoryStatus>()

    if (!scheduledData?.events.length || !statusData?.events.length) return []

    statusData.events.forEach((event) => {
      const args = event.args as StatusEventArgs | null
      if (!args) return

      const type = event.name === "DCA.Terminated" ? "Terminated" : "Completed"

      statusMap.set(args.id, { type, err: args.error })
    })

    const orders = scheduledData.events.map<TradeOrderHistoryItem | null>(
      (event) => {
        const args = event.args as ScheduledEventArgs | null
        const callArgs = event.call?.args as ScheduledCallArgs | null

        const schedule = callArgs
          ? findNested<ScheduleArgs>(callArgs, "schedule")
          : null

        if (!args || !schedule) return null

        const { order, period, totalAmount } = schedule

        const from = getAssetWithFallback(order.assetIn)
        const to = getAssetWithFallback(order.assetOut)

        const rawAmount = order.amountIn ?? order.maxAmountIn ?? null
        const amount = rawAmount ? scaleHuman(rawAmount, from.decimals) : null

        const isOpenBudget = totalAmount === "0"
        const totalBudget =
          !isOpenBudget && totalAmount
            ? scaleHuman(totalAmount, from.decimals)
            : null

        return {
          id: args.id,
          from,
          to,
          intervalBlocks: period,
          amount,
          totalBudget,
          isOpenBudget,
          status: statusMap.get(args.id) ?? null,
        }
      },
    )

    return orders.filter(isNonNullish)
  }, [scheduledData, statusData, getAssetWithFallback])

  return { orders, isLoading: isScheduledLoading || isStatusLoading }
}
