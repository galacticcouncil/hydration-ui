import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import {
  TimeSeriesBucketTimeRange,
  TradePricesDocument,
} from "@/codegen/__generated__/squid/graphql"

export const tradePricesQuery = (
  squidClient: GraphqlClient,
  assetInId: string,
  assetOutId: string,
  startTimestamp: string | null | undefined,
  endTimestamp: string | null | undefined,
  bucketSize?: TimeSeriesBucketTimeRange | null | undefined,
) =>
  queryOptions({
    queryKey: [
      "trade",
      "prices",
      assetInId,
      assetOutId,
      startTimestamp,
      endTimestamp,
      bucketSize,
    ],
    queryFn: () =>
      squidClient.gql(TradePricesDocument).send({
        assetInId,
        assetOutId,
        startTimestamp,
        endTimestamp,
        bucketSize,
      }),
  })
