import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { intentsByAccountQuery } from "@/api/intents"
import { OrderData, OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useIntentOrdersData = (assetIds: string[]) => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const { data: intents, isLoading } = useQuery(
    intentsByAccountQuery(rpc, account?.address ?? ""),
  )

  const orders = useMemo<OrderData[]>(() => {
    if (!intents) return []

    return intents
      .filter((entry) => entry.intent.data.type === "Swap")
      .filter((entry) => {
        if (assetIds.length === 0) return true
        const swap = entry.intent.data.value
        return (
          assetIds.includes(String(swap.asset_in)) ||
          assetIds.includes(String(swap.asset_out))
        )
      })
      .map((entry) => {
        const swap = entry.intent.data.value
        const from = getAssetWithFallback(String(swap.asset_in))
        const to = getAssetWithFallback(String(swap.asset_out))

        const fromAmount = scaleHuman(swap.amount_in, from.decimals)
        const toAmount = scaleHuman(swap.amount_out, to.decimals)

        return {
          kind: OrderKind.Limit,
          scheduleId: Number(entry.id),
          from,
          fromAmountBudget: fromAmount,
          fromAmountExecuted: null,
          fromAmountRemaining: fromAmount,
          singleTradeSize: null,
          to,
          toAmountExecuted: toAmount,
          status: DcaScheduleStatus.Created,
          blocksPeriod: null,
          isOpenBudget: false,
          intentId: entry.id,
          deadline: entry.intent.deadline,
        }
      })
  }, [intents, assetIds, getAssetWithFallback])

  return { orders, isLoading }
}
