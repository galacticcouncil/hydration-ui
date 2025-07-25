import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"
import { TimeSeriesBucketTimeRange } from "@/squid/__generated__/types"

export const tradePricesQuery = (
  squidSdk: SquidSdk,
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
      squidSdk.TradePrices({
        assetInId,
        assetOutId,
        startTimestamp,
        endTimestamp,
        bucketSize,
      }),
  })
