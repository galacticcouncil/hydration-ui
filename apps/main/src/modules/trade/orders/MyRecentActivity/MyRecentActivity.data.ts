import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import {
  DcaScheduleStatus,
  isDcaScheduleStatus,
  userSwapsQuery,
} from "@/api/graphql/trade-orders"
import { useSquidClient } from "@/api/provider"
import { SwapFragment } from "@/codegen/__generated__/squid/graphql"
import { getSubscanLink } from "@/links/subscan"
import { OrderKind } from "@/modules/trade/orders/lib/useOrderData"
import { MyRecentActivitySwap } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type MarketSwapStatus = {
  readonly kind: "market"
  readonly status: "filled"
}

export type MyActivityDcaOrderStatus = {
  readonly kind: OrderKind.Dca
  readonly status: DcaScheduleStatus | null
  readonly scheduleId: number
  readonly sold: string
  readonly total: string
}

export type OrderStatus = MarketSwapStatus | MyActivityDcaOrderStatus

export const useMyRecentActivityData = (
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const squidClient = useSquidClient()
  const { data, isLoading, isPending } = useQuery(
    userSwapsQuery(squidClient, address, assetIds, page, pageSize),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.swaps?.totalCount ?? 0
  const swaps = useMemo(
    () =>
      data?.swaps?.nodes
        .filter((swap) => !!swap)
        .map<MyRecentActivitySwap>((swap) => {
          const from = getAssetWithFallback(
            swap.swapInputs.nodes[0]?.asset?.assetRegistryId ?? "",
          )
          const to = getAssetWithFallback(
            swap.swapOutputs.nodes[0]?.asset?.assetRegistryId ?? "",
          )
          const fromAmount = scaleHuman(
            swap.swapInputs.nodes[0]?.amount || "0",
            from.decimals,
          )
          const toAmount = scaleHuman(
            swap.swapOutputs.nodes[0]?.amount || "0",
            to.decimals,
          )

          const fillPrice = Big(toAmount).gt(0)
            ? Big(fromAmount).div(toAmount).toString()
            : "0"
          const status = getOrderStatus(swap)
          const link = swap.event
            ? getSubscanLink(
                swap.event?.paraBlockHeight,
                swap.event?.indexInBlock,
              )
            : null

          return {
            from,
            fromAmount,
            to,
            toAmount,
            fillPrice,
            status,
            link,
          }
        }) ?? [],
    [data, getAssetWithFallback],
  )

  return { swaps, totalCount, isLoading, isPending }
}

const getOrderStatus = (swap: SwapFragment): OrderStatus | null => {
  if (!swap.dcaScheduleExecutionEvent) {
    return { kind: "market", status: "filled" }
  }

  const schedule = swap.dcaScheduleExecutionEvent.scheduleExecution?.schedule

  if (!schedule) {
    return null
  }

  return {
    kind: OrderKind.Dca,
    scheduleId: Number(schedule.id),
    sold: schedule.amountIn || "0",
    total: schedule.totalExecutedAmountIn || "0",
    status: isDcaScheduleStatus(schedule.status) ? schedule.status : null,
  }
}
