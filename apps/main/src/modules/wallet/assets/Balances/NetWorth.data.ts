import { accountNetWorthHistoricalDataQuery } from "@galacticcouncil/indexer/squid"
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

export const useNetWorthData = (
  timeFrame: NetWorthTimeFrameType | null,
  currentNetWorth: string,
  isCurrentLoading: boolean,
) => {
  const squidClient = useSquidClient()
  const { account } = useAccount()

  const [startTimestamp, endTimestamp] = useMemo(() => {
    if (!timeFrame) {
      return []
    }

    const now = Date.now()
    const ms = TIME_FRAME_MS[timeFrame]

    return [(now - ms).toString(), now.toString()]
    // refetch net worth data on latest balance change to keep it consistent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFrame, currentNetWorth])

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

  const balances = useMemo(() => {
    if (isLoading || isCurrentLoading) {
      return []
    }

    const buckets =
      data?.accountTotalBalancesByPeriod.nodes.flatMap(
        (node) => node?.buckets ?? [],
      ) ?? []

    const currentNetWorthNum = Number(currentNetWorth)

    if (!buckets.length) {
      if (!currentNetWorthNum) {
        return []
      }

      return [
        {
          netWorth: currentNetWorthNum,
          time: new Date(),
        },
        {
          netWorth: currentNetWorthNum,
          time: new Date(Date.now() + 1000),
        },
      ]
    }

    const balances = buckets.map<NetWorthData>((bucket) => ({
      netWorth: Number(bucket.transferableNorm) || 0,
      time: new Date(Number(bucket.timestamp)),
    }))

    const lastBalance = balances[balances.length - 1]

    const withCurrentBalance = currentNetWorthNum
      ? balances.concat([
          {
            netWorth: currentNetWorthNum,
            time: lastBalance
              ? new Date(lastBalance.time.valueOf() + 1000)
              : new Date(),
          },
        ])
      : balances.length === 1 && lastBalance
        ? balances.concat([
            {
              netWorth: lastBalance.netWorth,
              time: new Date(lastBalance.time.valueOf() + 1000),
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
  }, [data, isLoading, currentNetWorth, isCurrentLoading])

  return {
    balances,
    assetId: data?.accountTotalBalancesByPeriod.nodes[0]?.referenceAssetId,
    isError,
    isLoading: isLoading || isCurrentLoading,
    isSuccess,
  }
}

const bucketSizes: Record<NetWorthTimeFrameType, TimeSeriesBucketTimeRange> = {
  hour: TimeSeriesBucketTimeRange["15S"],
  day: TimeSeriesBucketTimeRange["5M"],
  week: TimeSeriesBucketTimeRange["1H"],
  month: TimeSeriesBucketTimeRange["1D"],
}
