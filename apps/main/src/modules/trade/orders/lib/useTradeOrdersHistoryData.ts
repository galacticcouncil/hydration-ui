import {
  ordersStatusQuery,
  scheduledOrdersQuery,
} from "@galacticcouncil/indexer/indexer"
import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { findNested, safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { isNonNullish } from "remeda"

import { useIndexerClient } from "@/api/provider"
import { useDcaGrafanaEnrichment } from "@/modules/trade/orders/lib/useDcaGrafanaEnrichment"
import {
  DcaOrderData,
  OrderKind,
} from "@/modules/trade/orders/lib/useOrdersData"
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

  const orders = useMemo<Array<DcaOrderData>>(() => {
    const statusMap = new Map<number, DcaScheduleStatus>()

    if (!scheduledData?.events.length || !statusData?.events.length) return []

    statusData.events.forEach((event) => {
      const args = event.args as StatusEventArgs | null
      if (!args) return

      statusMap.set(
        args.id,
        event.name === "DCA.Terminated"
          ? DcaScheduleStatus.Terminated
          : DcaScheduleStatus.Completed,
      )
    })

    return scheduledData.events
      .map<DcaOrderData | null>((event) => {
        const args = event.args as ScheduledEventArgs | null
        const callArgs = event.call?.args as ScheduledCallArgs | null

        const schedule = callArgs
          ? findNested<ScheduleArgs>(callArgs, "schedule")
          : null

        if (!args || !schedule) return null

        const status = statusMap.get(args.id)
        // this indexer only emits Scheduled/Terminated/Completed - a schedule
        // with no terminal event is still open, and those rows are served from
        // chain state instead
        if (!status) return null

        const { order, period, totalAmount } = schedule

        const from = getAssetWithFallback(order.assetIn)
        const to = getAssetWithFallback(order.assetOut)

        const rawSingleTradeSize = order.amountIn ?? order.maxAmountIn ?? null
        const isOpenBudget = totalAmount === "0"

        return {
          kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
          scheduleId: args.id,
          from,
          to,
          fromAmountBudget: isOpenBudget
            ? null
            : scaleHuman(totalAmount, from.decimals),
          fromAmountExecuted: null,
          fromAmountRemaining: null,
          singleTradeSize: rawSingleTradeSize
            ? scaleHuman(rawSingleTradeSize, from.decimals)
            : null,
          toAmountExecuted: null,
          status,
          blocksPeriod: String(period),
          isOpenBudget,
          timestamp: null,
          limitPrice: null,
        }
      })
      .filter(isNonNullish)
  }, [scheduledData, statusData, getAssetWithFallback])

  const { orders: enrichedOrders } = useDcaGrafanaEnrichment(orders)

  return {
    orders: enrichedOrders,
    isLoading: isScheduledLoading || isStatusLoading,
  }
}
