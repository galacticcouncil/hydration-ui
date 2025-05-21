import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import { OtcOrderStatusDocument } from "@/codegen/__generated__/indexer/graphql"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const otcOrderStatusQuery = (
  indexerClient: GraphqlClient,
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "trade", "otc", "OrderStatus", orderId],
    queryFn: () => indexerClient.gql(OtcOrderStatusDocument).send({ orderId }),
    enabled: !!orderId && isPartiallyFillable,
  })
