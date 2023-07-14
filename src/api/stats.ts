import { useQuery } from "@tanstack/react-query"
import { Maybe } from "graphql/jsutils/Maybe"
import { QUERY_KEYS } from "utils/queryKeys"

export type StatsData = {
  interval: string
  volume_usd: number
  tvl_usd: number
  tvl_pol_usd: number
  volume_roll_24_usd: number
}

export enum StatsTimeframe {
  ALL = "all",
  WEEKLY = "weekly",
  DAILY = "daily",
}

export const useStats = (
  data: Maybe<{
    timeframe?: StatsTimeframe
    assetSymbol?: string
  }>,
) => {
  const { timeframe, assetSymbol } = data ?? {}
  return useQuery(
    QUERY_KEYS.stats(timeframe, assetSymbol),
    async () => {
      const res = await getStats(timeframe, assetSymbol)()

      if (!res.length) {
        throw new Error("Error fetching stats data")
      }

      return res
    },
    { retry: 0 },
  )
}

const getStats =
  (timeframe?: StatsTimeframe, assetSymbol?: string) => async () => {
    const res = await fetch(
      `https://api.hydradx.io/hydradx-ui/v1/stats/${assetSymbol ?? ""}${
        timeframe ? `?timeframe=${timeframe}` : ""
      }`,
    )

    const data: Promise<StatsData[]> = res.json()

    return data
  }
