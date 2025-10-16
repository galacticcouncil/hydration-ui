import {
  DcaScheduleStatus,
  isDcaScheduleStatus,
  userOrdersQuery,
} from "@galacticcouncil/indexer/squid"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export enum OrderKind {
  Dca = "dca",
}

export type OrderData = {
  readonly kind: OrderKind
  readonly scheduleId: number
  readonly from: TAsset
  readonly fromAmountBudget: string
  readonly fromAmountExecuted: string
  readonly fromAmountRemaining: string
  readonly singleTradeSize: string
  readonly to: TAsset
  readonly toAmountExecuted: string
  readonly price: string
  readonly status: DcaScheduleStatus | null
  readonly blocksPeriod: number | null
}

export const useOrdersData = (
  status: Array<DcaScheduleStatus>,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
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
  const orders = useMemo<Array<OrderData>>(
    () =>
      data?.dcaSchedules?.nodes
        .filter((schedule) => !!schedule)
        .map((schedule) => {
          const from = getAssetWithFallback(
            schedule.assetIn?.assetRegistryId ?? "",
          )
          const fromAmountBudget = scaleHuman(
            schedule.budgetAmountIn,
            from.decimals,
          )
          const fromAmountExecuted = scaleHuman(
            schedule.totalExecutedAmountIn,
            from.decimals,
          )
          const fromAmountRemaining = Big(fromAmountBudget)
            .minus(fromAmountExecuted)
            .toString()
          const singleTradeSize = scaleHuman(
            schedule.singleTradeSize,
            from.decimals,
          )

          const to = getAssetWithFallback(
            schedule.assetOut?.assetRegistryId ?? "",
          )

          const toAmountExecuted = scaleHuman(
            schedule.totalExecutedAmountOut,
            to.decimals,
          )
          const price = Big(toAmountExecuted).gt(0)
            ? Big(fromAmountExecuted).div(toAmountExecuted).toString()
            : "0"

          return {
            kind: OrderKind.Dca,
            scheduleId: Number(schedule.id),
            from,
            fromAmountBudget,
            fromAmountExecuted,
            fromAmountRemaining,
            singleTradeSize,
            to,
            toAmountExecuted,
            price,
            status: isDcaScheduleStatus(schedule.status)
              ? schedule.status
              : null,
            blocksPeriod: schedule.period ?? null,
          }
        }) ?? [],
    [data, getAssetWithFallback],
  )

  return { orders, totalCount, isLoading }
}
