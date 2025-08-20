import { accountNetWorthHistoricalDataQuery } from "@galacticcouncil/indexer/squid"
import { TimeSeriesBucketTimeRange } from "@galacticcouncil/indexer/squid"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useSquidClient } from "@/api/provider"
import { PeriodType } from "@/components/PeriodInput/PeriodInput"
import { PERIOD_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { chronologically, sortBy } from "@/utils/sort"

export type NetWorthData = {
  readonly netWorth: number
  readonly time: Date
}

export const useNetWorthData = (period: PeriodType | null) => {
  const squidClient = useSquidClient()
  const { account } = useAccount()

  const [startTimestamp, endTimestamp] = useMemo(() => {
    if (!period) {
      return []
    }

    const now = Date.now()
    const ms = PERIOD_MS[period]

    return [(now - ms).toString(), now.toString()]
  }, [period])

  const bucketSize = period
    ? bucketSizes[period]
    : TimeSeriesBucketTimeRange["1D"]

  const { data, isError, isLoading, isSuccess } = useQuery(
    accountNetWorthHistoricalDataQuery(
      squidClient,
      account?.publicKey ?? "",
      startTimestamp,
      endTimestamp,
      bucketSize,
    ),
  )

  const balances = useMemo(() => {
    if (isLoading || !data?.accountTotalBalancesByPeriod) {
      return []
    }

    const balances =
      data.accountTotalBalancesByPeriod.nodes.flatMap<NetWorthData>((node) => {
        if (!node?.buckets) {
          return []
        }

        return node.buckets.map<NetWorthData>((bucket) => ({
          netWorth: Number(bucket.transferableNorm) || 0,
          time: new Date(Number(bucket.timestamp)),
        }))
      })

    const firstBalance = balances[0]

    if (balances.length === 1 && firstBalance) {
      return [
        ...balances,
        {
          netWorth: firstBalance.netWorth,
          time: new Date(firstBalance.time.valueOf() + 1),
        } satisfies NetWorthData,
      ]
    }

    return balances.sort(
      sortBy({
        select: (balances) => balances.time,
        compare: chronologically,
      }),
    )
  }, [data, isLoading])

  return {
    balances,
    assetId: data?.accountTotalBalancesByPeriod.nodes[0]?.referenceAssetId,
    isError,
    isLoading,
    isSuccess,
  }
}

const bucketSizes: Record<PeriodType, TimeSeriesBucketTimeRange> = {
  hour: TimeSeriesBucketTimeRange["15S"],
  day: TimeSeriesBucketTimeRange["5M"],
  week: TimeSeriesBucketTimeRange["1H"],
  month: TimeSeriesBucketTimeRange["1D"],
}
