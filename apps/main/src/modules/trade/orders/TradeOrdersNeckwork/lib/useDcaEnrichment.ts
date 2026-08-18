import {
  DCA_OPEN_STATUSES,
  dcaSchedulesQuery,
} from "@galacticcouncil/indexer/neckwork"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { neckworkClient } from "@/api/provider"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { scaleHuman } from "@/utils/formatting"

const PAGE_SIZE = 100

export const useDcaEnrichment = (orders: Array<OrderData>) => {
  const { account } = useAccount()
  const owner = safeConvertSS58toPublicKey(account?.address ?? "")

  const { data } = useQuery(
    dcaSchedulesQuery(neckworkClient, {
      owner,
      statuses: DCA_OPEN_STATUSES,
      assetIds: [],
      page: 0,
      pageSize: PAGE_SIZE,
    }),
  )

  const enrichment = useMemo(
    () =>
      new Map(
        (data?.items ?? []).map((schedule) => [
          schedule.scheduleId,
          {
            executedAmountIn: schedule.executedAmountIn,
            executedAmountOut: schedule.executedAmountOut,
          },
        ]),
      ),
    [data],
  )

  return useMemo(
    () =>
      orders.map((order) => {
        const executed = enrichment.get(order.scheduleId)
        if (!executed) return order

        return {
          ...order,
          fromAmountExecuted: scaleHuman(
            executed.executedAmountIn,
            order.from.decimals,
          ),
          toAmountExecuted: scaleHuman(
            executed.executedAmountOut,
            order.to.decimals,
          ),
        }
      }),
    [orders, enrichment],
  )
}
