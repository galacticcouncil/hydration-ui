import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import { OtcOrderStatusDocument } from "@/codegen/__generated__/indexer/graphql"

export const otcOrderStatusQuery = (
  indexerClient: GraphqlClient,
  orderId: number,
  isPartiallyFillable: boolean,
) =>
  queryOptions({
    queryKey: ["trade", "otc", "OrderStatus", orderId],
    queryFn: () => indexerClient.gql(OtcOrderStatusDocument).send({ orderId }),
    enabled: !!orderId && isPartiallyFillable,
  })
