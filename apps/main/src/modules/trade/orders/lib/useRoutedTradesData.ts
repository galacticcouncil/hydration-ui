import { useRoutedTradesQuery } from "@galacticcouncil/indexer/squid"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import {
  getOrderStatus,
  OrderStatus,
} from "@/modules/trade/orders/lib/useSwapsData"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export type RoutedTradeData = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly to: TAsset
  readonly toAmount: string
  readonly fillPrice: string
  readonly date: Date
  readonly status: OrderStatus | null
}

export const useRoutedTradesData = (
  address: string,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    useRoutedTradesQuery(squidClient, address, assetIds, page, pageSize),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.routedTrades?.totalCount ?? 0
  const swaps = useMemo<Array<RoutedTradeData>>(() => {
    return (
      data?.routedTrades?.nodes
        .filter((trade) => !!trade)
        .map<RoutedTradeData>((trade) => {
          const from = getAssetWithFallback(
            trade.routeTradeInputs.nodes[0]?.asset?.assetRegistryId ?? "",
          )
          const to = getAssetWithFallback(
            trade.routeTradeOutputs.nodes[0]?.asset?.assetRegistryId ?? "",
          )
          const fromAmount = scaleHuman(
            trade.routeTradeInputs.nodes[0]?.amount || "0",
            from.decimals,
          )
          const toAmount = scaleHuman(
            trade.routeTradeOutputs.nodes[0]?.amount || "0",
            to.decimals,
          )
          const fillPrice = Big(toAmount).gt(0)
            ? Big(fromAmount).div(toAmount).toString()
            : "0"

          const swap = trade.swaps.nodes[0]
          const status = swap
            ? getOrderStatus(swap, getAssetWithFallback)
            : null

          const date = new Date(trade.block?.timestamp ?? 0)

          return {
            from,
            fromAmount,
            to,
            toAmount,
            fillPrice,
            date,
            status,
          }
        }) ?? []
    )
  }, [data, getAssetWithFallback])

  return { swaps, totalCount, isLoading }
}
