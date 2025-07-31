import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const otcOrderStatusQuery = (
  indexerSdk: IndexerSdk,
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "trade", "otc", "OrderStatus", orderId],
    queryFn: () => indexerSdk.OtcOrderStatus({ orderId }),
    enabled: !!orderId && isPartiallyFillable,
  })
