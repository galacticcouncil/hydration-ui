import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
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

export const latestAccountBalanceQuery = (
  squidSdk: SquidSdk,
  accountId: string,
) => {
  return queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "account",
      "balance",
      "latest",
      accountId,
    ],
    queryFn: () => squidSdk.LatestAccountsBalances({ accountId }),
  })
}
