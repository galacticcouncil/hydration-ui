import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const otcOrderStatusQuery = (
  indexerSdk: IndexerSdk,
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    staleTime: Infinity,
    queryKey: ["trade", "otc", "OrderStatus", orderId],
    queryFn: () => indexerSdk.OtcOrderStatus({ orderId }),
    enabled: !!orderId && isPartiallyFillable,
  })
