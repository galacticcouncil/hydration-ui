import { dcaSchedulesQuery } from "@galacticcouncil/indexer/neckwork"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { neckworkClient } from "@/api/neckwork"
import {
  toApiDcaStatuses,
  toDcaScheduleStatus,
} from "@/modules/trade/orders/lib/apiVocabulary"
import {
  DcaScheduleStatus,
  OrderData,
  OrderKind,
} from "@/modules/trade/orders/lib/types"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const useHistoryData = (
  statuses: ReadonlyArray<DcaScheduleStatus>,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const owner = safeConvertSS58toPublicKey(accountAddress)

  const { data, isLoading } = useQuery({
    ...dcaSchedulesQuery(neckworkClient, {
      owner,
      statuses: toApiDcaStatuses(statuses),
      assetIds,
      page,
      pageSize,
    }),
    placeholderData: keepPreviousData,
  })

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
          status: toDcaScheduleStatus(schedule.status),
          date: new Date(schedule.lastEventAt ?? schedule.createdAt),
          blocksPeriod: String(schedule.periodBlocks),
          isOpenBudget: schedule.isRollingBudget,
        }
      }) ?? [],
    [data, getAssetWithFallback],
  )

  return { orders, totalCount, isLoading }
}
