import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import {
  AccountTotalBalancesByPeriodDocument,
  TimeSeriesBucketTimeRange,
} from "@/codegen/__generated__/squid/graphql"

export const accountNetWorthHistoricalDataQuery = (
  squidClient: GraphqlClient,
  accountId: string,
  startTimestamp: string | null | undefined,
  endTimestamp: string | null | undefined,
  bucketSize?: TimeSeriesBucketTimeRange | null | undefined,
) =>
  queryOptions({
    queryKey: [
      "account",
      "net-worth",
      "historical-data",
      accountId,
      startTimestamp,
      endTimestamp,
      bucketSize,
    ],
    queryFn: () =>
      squidClient.gql(AccountTotalBalancesByPeriodDocument).send({
        accountId,
        startTimestamp,
        endTimestamp,
        bucketSize,
      }),
    enabled: !!accountId,
  })
