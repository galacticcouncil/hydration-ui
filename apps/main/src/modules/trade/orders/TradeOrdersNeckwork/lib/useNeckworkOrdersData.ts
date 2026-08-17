import { dcaSchedulesQuery, DcaStatus } from "@galacticcouncil/indexer/neckwork"
import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { neckworkClient } from "@/api/provider"
import { OrderData, OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const STATUS_MAP: Record<DcaStatus, DcaScheduleStatus> = {
  created: DcaScheduleStatus.Created,
  completed: DcaScheduleStatus.Completed,
  terminated: DcaScheduleStatus.Terminated,
  cancelled: DcaScheduleStatus.Cancelled,
}

export const useNeckworkOrdersData = (
  statuses: readonly DcaStatus[],
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const owner = safeConvertSS58toPublicKey(accountAddress)

  const { data, isLoading } = useQuery(
    dcaSchedulesQuery(neckworkClient, {
      owner,
      statuses,
      assetIds,
      page,
      pageSize,
    }),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.totalCount ?? 0
  const orders = useMemo<Array<OrderData>>(
    () =>
      data?.items.map<OrderData>((schedule) => {
        const from = getAssetWithFallback(schedule.assetIn)
        const to = getAssetWithFallback(schedule.assetOut)

        const fromAmountBudget = scaleHuman(schedule.budget, from.decimals)
        const fromAmountExecuted = scaleHuman(
          schedule.executedAmountIn,
          from.decimals,
        )

        return {
          kind: schedule.isRollingBudget ? OrderKind.DcaRolling : OrderKind.Dca,
          scheduleId: schedule.scheduleId,
          from,
          fromAmountBudget,
          fromAmountExecuted,
          fromAmountRemaining: Big(fromAmountBudget)
            .minus(fromAmountExecuted)
            .toString(),
          singleTradeSize: scaleHuman(
            schedule.singleTradeAmount,
            from.decimals,
          ),
          to,
          toAmountExecuted: scaleHuman(schedule.executedAmountOut, to.decimals),
          status: STATUS_MAP[schedule.status],
          blocksPeriod: String(schedule.periodBlocks),
          isOpenBudget: schedule.isRollingBudget,
        }
      }) ?? [],
    [data, getAssetWithFallback],
  )

  return { orders, totalCount, isLoading }
}
