import { safeConvertIndexerAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { DcaScheduleStatus, tradeOrdersQuery } from "@/api/graphql/trade-orders"
import { useSquidClient } from "@/api/provider"
import { SwapFragment } from "@/codegen/__generated__/squid/graphql"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { MyRecentActivitySwap } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const useMyRecentActivityData = (page: number, pageSize: number) => {
  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertIndexerAddress(accountAddress)

  const squidClient = useSquidClient()
  const { data, isLoading } = useQuery(
    tradeOrdersQuery(squidClient, address, page, pageSize),
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
          const fillPrice = Big(toAmount).div(fromAmount).toString()
          const [type, status] = getTypeAndStatus(swap)

          return {
            from,
            fromAmount,
            to,
            toAmount,
            fillPrice,
            type,
            status,
          }
        }) ?? [],
    [data, getAssetWithFallback],
  )

  return { swaps, totalCount, isLoading }
}

// TODO fix logic
const getTypeAndStatus = (swap: SwapFragment): [SwapType, SwapStatus] => {
  if (!swap.dcaScheduleExecutionEvent) {
    return ["market", { type: "filled" }]
  }

  switch (swap.dcaScheduleExecutionEvent.scheduleExecution?.schedule?.status) {
    case DcaScheduleStatus.Completed:
      return ["dca", { type: "filled" }]
    case DcaScheduleStatus.Created:
      return ["dca", { type: "active" }]
    default:
      return ["dca", { type: "canceled" }]
  }
}
