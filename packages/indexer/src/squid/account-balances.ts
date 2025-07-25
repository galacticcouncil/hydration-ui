import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"
import { TimeSeriesBucketTimeRange } from "@/squid/__generated__/types"

export const accountNetWorthHistoricalDataQuery = (
  squidSdk: SquidSdk,
  accountId: string,
  startTimestamp: string | undefined,
  endTimestamp: string | undefined,
  bucketSize?: TimeSeriesBucketTimeRange | undefined,
) => {
  return queryOptions({
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
      squidSdk.AccountTotalBalancesByPeriod({
        accountId,
        startTimestamp,
        endTimestamp,
        bucketSize,
      }),
    enabled: !!accountId,
  })
}
