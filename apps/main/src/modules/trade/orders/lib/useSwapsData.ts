import {
  DcaScheduleStatus,
  isDcaScheduleStatus,
  isTradeOperation,
  SwapFragment,
  SwapsQueryAddress,
  TradeOperation,
  userSwapsQuery,
} from "@galacticcouncil/indexer/squid"
import { safeConvertAddressSS58, subscan } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { HYDRATION_CHAIN_KEY } from "@/utils/consts"
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
  readonly symbol: string
}

export type OrderStatus = MarketSwapStatus | MyActivityDcaOrderStatus

export type SwapData = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly to: TAsset
  readonly toAmount: string
  readonly type: TradeOperation | null
  readonly fillPrice: string
  readonly link: string | null
  readonly address: string | null
  readonly date: Date
  readonly status: OrderStatus | null
}

export const useSwapsData = (
  address: SwapsQueryAddress,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    userSwapsQuery(squidClient, address, assetIds, page, pageSize),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.swaps?.totalCount ?? 0
  const swaps = useMemo<Array<SwapData>>(() => {
    return (
      data?.swaps?.nodes
        .filter((swap) => !!swap)
        .map<SwapData>((swap) => {
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
          const link = swap.event
            ? subscan.blockEvent(
                HYDRATION_CHAIN_KEY,
                swap.event.paraBlockHeight,
                swap.event.indexInBlock,
              )
            : null
          const status = getOrderStatus(swap, getAssetWithFallback)
          const type = isTradeOperation(swap.operationType)
            ? swap.operationType
            : null
          const address = safeConvertAddressSS58(swap.swapperId ?? "")
          const date = new Date(swap.paraTimestamp)

          return {
            from,
            fromAmount,
            to,
            toAmount,
            fillPrice,
            link,
            address,
            date,
            type,
            status,
          }
        }) ?? []
    )
  }, [data, getAssetWithFallback])

  return { swaps, totalCount, isLoading }
}

const getOrderStatus = (
  swap: SwapFragment,
  getAsset: (id: string) => TAsset,
): OrderStatus | null => {
  if (!swap.dcaScheduleExecutionEvent) {
    return { kind: "market", status: "filled" }
  }

  const schedule = swap.dcaScheduleExecutionEvent.scheduleExecution?.schedule

  if (!schedule) {
    return null
  }

  const asset = getAsset(schedule.assetInId ?? "")

  return {
    kind: OrderKind.Dca,
    scheduleId: Number(schedule.id),
    sold: scaleHuman(schedule.totalExecutedAmountIn || "0", asset.decimals),
    total: scaleHuman(schedule.budgetAmountIn || "0", asset.decimals),
    symbol: asset.symbol,
    status: isDcaScheduleStatus(schedule.status) ? schedule.status : null,
  }
}
