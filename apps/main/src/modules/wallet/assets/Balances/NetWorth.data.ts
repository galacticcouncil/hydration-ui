import {
  accountNetWorthHistoricalDataQuery,
  latestAccountBalanceQuery,
} from "@galacticcouncil/indexer/squid"
import { TimeSeriesBucketTimeRange } from "@galacticcouncil/indexer/squid"
import { TIME_FRAME_MS } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { NetWorthTimeFrameType } from "@/modules/wallet/assets/Balances/NetWorth"
import { chronologically, sortBy } from "@/utils/sort"

export type NetWorthData = {
  readonly netWorth: number
  readonly time: Date
}

export const useNetWorthData = (timeFrame: NetWorthTimeFrameType | null) => {
  const squidClient = useSquidClient()
  const { account } = useAccount()

  const [startTimestamp, endTimestamp] = useMemo(() => {
    if (!timeFrame) {
      return []
    }

    const now = Date.now()
    const ms = TIME_FRAME_MS[timeFrame]

    return [(now - ms).toString(), now.toString()]
  }, [timeFrame])

  const bucketSize = timeFrame
    ? bucketSizes[timeFrame]
    : TimeSeriesBucketTimeRange["1D"]

  const { data, isError, isLoading, isSuccess } = useQuery({
    ...accountNetWorthHistoricalDataQuery(
      squidClient,
      account?.publicKey ?? "",
      startTimestamp,
      endTimestamp,
      bucketSize,
    ),
    placeholderData: (prev) => prev,
  })

  const { data: latestBalanceData, isLoading: isLatestBalanceLoading } =
    useQuery(latestAccountBalanceQuery(squidClient, account?.publicKey ?? ""))

  const balances = useMemo(() => {
    if (isLoading || isLatestBalanceLoading) {
      return []
    }

    const buckets =
      data?.accountTotalBalancesByPeriod.nodes.flatMap(
        (node) => node?.buckets ?? [],
      ) ?? []

    const latestNetWorth = Number(
      latestBalanceData?.accountTotalBalanceHistoricalData?.nodes[0]
        ?.totalTransferableNorm,
    )

    if (!buckets.length) {
      if (!latestNetWorth) {
        return []
      }

      return [
        {
          netWorth: latestNetWorth,
          time: new Date(),
        },
        {
          netWorth: latestNetWorth,
          time: new Date(Date.now() + 1000),
        },
      ]
    }

    const balances = buckets.map<NetWorthData>((bucket) => ({
      netWorth: Number(bucket.transferableNorm) || 0,
      time: new Date(Number(bucket.timestamp)),
    }))

    const firstBalance = balances[0]

    const withCurrentBalance = latestNetWorth
      ? balances.concat([
          {
            netWorth: latestNetWorth,
            time: new Date(),
          },
        ])
      : balances.length === 1 && firstBalance
        ? balances.concat([
            {
              netWorth: firstBalance.netWorth,
              time: new Date(firstBalance.time.valueOf() + 1),
            },
          ])
        : balances

    return withCurrentBalance
      .sort(
        sortBy({
          select: (balances) => balances.time,
          compare: chronologically,
        }),
      )
      .concat()
  }, [data, isLoading, latestBalanceData, isLatestBalanceLoading])

  return {
    balances,
    assetId: data?.accountTotalBalancesByPeriod.nodes[0]?.referenceAssetId,
    isError,
    isLoading: isLoading || isLatestBalanceLoading,
    isSuccess,
  }
}

const bucketSizes: Record<NetWorthTimeFrameType, TimeSeriesBucketTimeRange> = {
  hour: TimeSeriesBucketTimeRange["15S"],
  day: TimeSeriesBucketTimeRange["5M"],
  week: TimeSeriesBucketTimeRange["1H"],
  month: TimeSeriesBucketTimeRange["1D"],
}
