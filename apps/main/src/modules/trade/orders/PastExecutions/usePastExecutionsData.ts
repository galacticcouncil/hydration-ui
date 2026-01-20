import {
  dcaScheduleExecutionsQuery,
  DcaScheduleExecutionStatus,
  isDcaScheduleExecutionStatus,
} from "@galacticcouncil/indexer/squid"
import {
  IndexerErrorState,
  parseIndexerErrorState,
} from "@galacticcouncil/indexer/squid/lib/parseIndexerErrorState"
import { subscan } from "@galacticcouncil/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { TransactionStatusVariant } from "@/components/TransactionItem/TransactionStatus.styled"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"
import { chronologicallyDesc, sortBy } from "@/utils/sort"

export type PastExecutionData = {
  readonly id: string
  readonly status: TransactionStatusVariant
  readonly amountIn: string
  readonly amountOut: string
  readonly timestamp: Date | null
  readonly link: string | null
  readonly errorState: IndexerErrorState | null
}

export const usePastExecutionsData = (scheduleId: number) => {
  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    dcaScheduleExecutionsQuery(squidClient, scheduleId),
  )

  const { getAssetWithFallback } = useAssets()

  const assetIn = getAssetWithFallback(
    data?.dcaSchedule?.assetIn?.assetRegistryId ?? "",
  )
  const assetOut = getAssetWithFallback(
    data?.dcaSchedule?.assetOut?.assetRegistryId ?? "",
  )

  const executions = useMemo(() => {
    return (
      data?.dcaSchedule?.dcaScheduleExecutionsByScheduleId?.nodes
        .filter((execution) => execution !== null)
        .map<PastExecutionData | null>((execution) => {
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

          const executionEvent =
            execution.dcaScheduleExecutionEventsByScheduleExecutionId.nodes.at(
              0,
            )

          const event = executionEvent?.event

          const timestamp = event?.block?.timestamp ?? null

          const link = event
            ? subscan.blockEvent(
                HYDRATION_CHAIN_KEY,
                event.paraBlockHeight,
                event.indexInBlock,
              )
            : null

          return {
            id: execution.id,
            status,
            amountIn,
            amountOut,
            timestamp: timestamp ? new Date(timestamp) : null,
            link,
            errorState: parseIndexerErrorState(executionEvent?.errorState),
          }
        })
        .filter((execution) => execution !== null)
        .sort(
          sortBy({
            select: (execution) => execution.timestamp ?? new Date(0),
            compare: chronologicallyDesc,
          }),
        ) ?? []
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
