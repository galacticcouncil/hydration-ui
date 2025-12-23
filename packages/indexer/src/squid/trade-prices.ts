import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"
import { TimeSeriesBucketTimeRange } from "@/squid/__generated__/types"

export const tradePricesQuery = (
  squidSdk: SquidSdk,
  assetInId: string,
  assetOutId: string,
  startTimestamp: string | undefined,
  endTimestamp: string | undefined,
  bucketSize?: TimeSeriesBucketTimeRange | undefined,
) =>
  queryOptions({
    placeholderData: keepPreviousData,
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
      squidSdk.TradePrices({
        assetInId,
        assetOutId,
        startTimestamp,
        endTimestamp,
        bucketSize,
      }),
  })
