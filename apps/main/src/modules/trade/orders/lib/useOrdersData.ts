import {
  DcaScheduleStatus,
  getDcaScheduleStatus,
  userOrdersQuery,
} from "@galacticcouncil/indexer/squid"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import {
  DcaOrderData,
  OrderKind,
  OrderStatus,
} from "@/modules/trade/orders/lib/orderData"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export * from "@/modules/trade/orders/lib/orderData"

const SQUID_STATUS_MAP: Record<DcaScheduleStatus, OrderStatus> = {
  [DcaScheduleStatus.Created]: OrderStatus.Created,
  [DcaScheduleStatus.Completed]: OrderStatus.Completed,
  [DcaScheduleStatus.Terminated]: OrderStatus.Terminated,
  [DcaScheduleStatus.Cancelled]: OrderStatus.Cancelled,
}

export const toOrderStatus = (
  status: DcaScheduleStatus | null,
): OrderStatus | null => (status ? SQUID_STATUS_MAP[status] : null)

export const useOrdersData = (
  status: Array<DcaScheduleStatus>,
  assetIds: Array<string>,
  page: number | undefined,
  pageSize: number | undefined,
) => {
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    userOrdersQuery(squidClient, address, status, assetIds, page, pageSize),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.dcaSchedules?.totalCount ?? 0
  const orders = useMemo<Array<DcaOrderData>>(
    () =>
      data?.dcaSchedules?.nodes
        .filter((schedule) => !!schedule)
        .map<DcaOrderData>((schedule) => {
          const isOpenBudget = schedule.budgetAmountIn === "0"

          const from = getAssetWithFallback(
            schedule.assetIn?.assetRegistryId ?? "",
          )

          const fromAmountBudget = schedule.budgetAmountIn
            ? scaleHuman(schedule.budgetAmountIn, from.decimals)
            : null

          const fromAmountExecuted = schedule.totalExecutedAmountIn
            ? scaleHuman(schedule.totalExecutedAmountIn, from.decimals)
            : null

          const fromAmountRemaining =
            fromAmountExecuted && fromAmountBudget
              ? Big(fromAmountBudget).minus(fromAmountExecuted).toString()
              : null

          const singleTradeSize = schedule.singleTradeSize
            ? scaleHuman(schedule.singleTradeSize, from.decimals)
            : null

          const to = getAssetWithFallback(
            schedule.assetOut?.assetRegistryId ?? "",
          )

          const toAmountExecuted = schedule.totalExecutedAmountOut
            ? scaleHuman(schedule.totalExecutedAmountOut, to.decimals)
            : null

          const status = toOrderStatus(getDcaScheduleStatus(schedule))

          return {
            kind: isOpenBudget ? OrderKind.DcaRolling : OrderKind.Dca,
            scheduleId: Number(schedule.id),
            from,
            fromAmountBudget,
            fromAmountExecuted,
            fromAmountRemaining,
            singleTradeSize,
            to,
            toAmountExecuted,
            status,
            blocksPeriod: schedule.period ?? null,
            isOpenBudget,
            limitPrice: null,
            timestamp: null,
          }
        }) ?? [],
    [data, getAssetWithFallback],
  )

  return { orders, totalCount, isLoading }
}
