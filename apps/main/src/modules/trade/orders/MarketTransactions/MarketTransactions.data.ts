import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { isTradeOperation, userSwapsQuery } from "@/api/graphql/trade-orders"
import { useSquidClient } from "@/api/provider"
import { getSubscanLink } from "@/links/subscan"
import { MarketTransaction } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.column"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const useMarketTransactionsData = (
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const squidClient = useSquidClient()
  const { data, isLoading, isPending } = useQuery(
    userSwapsQuery(squidClient, true, assetIds, page, pageSize),
  )

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.swaps?.totalCount ?? 0
  const transactions = useMemo<Array<MarketTransaction>>(() => {
    return (
      data?.swaps?.nodes
        .filter((swap) => !!swap)
        .map<MarketTransaction>((swap) => {
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
          const fillPrice = Big(fromAmount).div(toAmount).toString()
          const link = swap.event
            ? getSubscanLink(
                swap.event?.paraBlockHeight,
                swap.event?.indexInBlock,
              )
            : null

          const type = isTradeOperation(swap.operationType)
            ? swap.operationType
            : null
          const address = safeConvertAddressSS58(swap.swapperId ?? "")
          const timestamp = swap.paraTimestamp

          return {
            from,
            fromAmount,
            to,
            toAmount,
            fillPrice,
            link,
            address,
            timestamp,
            type,
          }
        }) ?? []
    )
  }, [data, getAssetWithFallback])

  return { transactions, totalCount, isLoading, isPending }
}
