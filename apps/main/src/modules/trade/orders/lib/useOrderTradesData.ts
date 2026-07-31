import {
  orderPlannedExecutionQuery,
  orderTradesQuery,
} from "@galacticcouncil/indexer/indexer"
import { HYDRATION_CHAIN_KEY, subscan } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useIndexerClient } from "@/api/provider"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { PastExecutionData } from "@/modules/trade/orders/PastExecutions/usePastExecutionsData"
import { TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type TradeEventArgs = {
  readonly id: number
  readonly amountIn?: string
  readonly amountOut?: string
  readonly error?: string
}

type PlannedEventArgs = {
  readonly id: number
  readonly block: number
}

export const useOrderTradesData = (
  scheduleId: number,
  from: TAsset,
  to: TAsset,
) => {
  const indexerSdk = useIndexerClient()

  const { data: tradesData, isLoading: isTradesLoading } = useQuery(
    orderTradesQuery(indexerSdk, scheduleId),
  )
  const { data: plannedData, isLoading: isPlannedLoading } = useQuery(
    orderPlannedExecutionQuery(indexerSdk, scheduleId),
  )

  const executions = useMemo<ReadonlyArray<PastExecutionData>>(() => {
    return (
      tradesData?.events.map<PastExecutionData>((event) => {
        const args = event.args as TradeEventArgs | null

        const isSuccess = event.name === "DCA.TradeExecuted"
        const status = isSuccess
          ? TransactionStatusVariant.Success
          : TransactionStatusVariant.Warning

        const amountIn = isSuccess
          ? scaleHuman(args?.amountIn || "0", from.decimals)
          : "0"
        const amountOut = isSuccess
          ? scaleHuman(args?.amountOut || "0", to.decimals)
          : "0"

        const timestamp = event.block.timestamp
          ? new Date(event.block.timestamp)
          : null

        const link = subscan.block(HYDRATION_CHAIN_KEY, event.block.height)

        return {
          id: `${event.block.height}-${args?.id ?? scheduleId}-${event.name}`,
          status,
          amountIn,
          amountOut,
          timestamp,
          link,
          errorState: null,
        }
      }) ?? []
    )
  }, [tradesData, from.decimals, to.decimals, scheduleId])

  const nextExecutionBlock = useMemo<number | null>(() => {
    const args = plannedData?.events.at(0)?.args as PlannedEventArgs | null
    return args?.block ?? null
  }, [plannedData])

  return {
    executions,
    nextExecutionBlock,
    isLoading: isTradesLoading || isPlannedLoading,
  }
}
