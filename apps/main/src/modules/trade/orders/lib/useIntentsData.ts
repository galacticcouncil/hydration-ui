import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { intentsByAccountQuery } from "@/api/intents"
import { OrderData, OrderKind } from "@/modules/trade/orders/lib/useOrdersData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useIntentsData = () => {
  const { account } = useAccount()
  const provider = useRpcProvider()
  const { getAssetWithFallback } = useAssets()

  const { data, isLoading } = useQuery(
    intentsByAccountQuery(provider, account?.address ?? ""),
  )

  const orders = useMemo<Array<OrderData>>(
    () =>
      (data ?? [])
        .map(({ id, intent }: any) => {
          if (intent.data.type !== "Swap") return null

          const swap = intent.data.value
          const from = getAssetWithFallback(String(swap.asset_in))
          const to = getAssetWithFallback(String(swap.asset_out))
          const fromAmount = scaleHuman(swap.amount_in.toString(), from.decimals)
          const toAmount = scaleHuman(swap.amount_out.toString(), to.decimals)

          return {
            kind: OrderKind.Limit,
            scheduleId: Number(id),
            intentId: id,
            from,
            fromAmountBudget: fromAmount,
            fromAmountExecuted: null,
            fromAmountRemaining: null,
            singleTradeSize: null,
            to,
            toAmountExecuted: toAmount,
            status: null,
            blocksPeriod: null,
            isOpenBudget: false,
          } satisfies OrderData
        })
        .filter((o: any): o is OrderData => o !== null) as OrderData[],
    [data, getAssetWithFallback],
  )

  return { orders, isLoading }
}
