import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  DcaScheduleExecutionStatus,
  dcaScheduleSwapsQuery,
  isDcaScheduleExecutionStatus,
} from "@/api/graphql/trade-orders"
import { useSquidClient } from "@/api/provider"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type PastTransactionData = {
  readonly id: string
  readonly status: TransactionStatusVariant
  readonly amountIn: string
  readonly amountOut: string
  readonly timestamp: string | null
}

export const usePastTransactionsData = (scheduleId: number) => {
  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    dcaScheduleSwapsQuery(squidClient, scheduleId),
  )

  const { getAssetWithFallback } = useAssets()

  const assetIn = getAssetWithFallback(data?.dcaSchedule?.assetInId ?? "")
  const assetOut = getAssetWithFallback(data?.dcaSchedule?.assetOutId ?? "")

  const executions = useMemo(() => {
    return (
      data?.dcaSchedule?.dcaScheduleExecutionsByScheduleId?.nodes
        .filter((execution) => execution !== null)
        .map<PastTransactionData | null>((execution) => {
          if (!isDcaScheduleExecutionStatus(execution.status)) {
            return null
          }

          const amountIn = scaleHuman(
            execution.amountIn || "0",
            assetIn.decimals,
          )
          const amountOut = scaleHuman(
            execution.amountOut || "0",
            assetOut.decimals,
          )

          const status = statusMap[execution.status]

          const timestamp: string | null =
            execution.dcaScheduleExecutionEventsByScheduleExecutionId.nodes
              .map((executionEvent) => executionEvent?.event?.block?.timestamp)
              .filter((timestamp) => !!timestamp)
              .at(0) ?? null

          return {
            id: execution.id,
            status: status,
            amountIn,
            amountOut,
            timestamp,
          }
        })
        .filter((execution) => execution !== null) ?? []
    )
  }, [data, assetIn.decimals, assetOut.decimals])

  return { assetIn, assetOut, executions, isLoading }
}

const statusMap: Record<DcaScheduleExecutionStatus, TransactionStatusVariant> =
  {
    [DcaScheduleExecutionStatus.Planned]: TransactionStatusVariant.Pending,
    [DcaScheduleExecutionStatus.Executed]: TransactionStatusVariant.Success,
    [DcaScheduleExecutionStatus.Failed]: TransactionStatusVariant.Warning,
  }
