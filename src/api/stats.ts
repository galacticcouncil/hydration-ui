import { useQuery } from "@tanstack/react-query"
import { Maybe } from "graphql/jsutils/Maybe"
import { ChartType } from "sections/stats/components/ChartsWrapper/ChartsWrapper"
import { QUERY_KEYS } from "utils/queryKeys"

export type StatsData = {
  timestamp: string
  volume_usd: number
  tvl_usd: number
  tvl_pol_usd: number
  volume_roll_24_usd: number
}

export enum StatsTimeframe {
  DAILY = "daily",
  HOURLY = "hourly",
}

export const useStats = (
  data: Maybe<{
    timeframe?: StatsTimeframe
    assetSymbol?: string
    type: ChartType
  }>,
) => {
  const { timeframe, assetSymbol, type = "tvl" } = data ?? {}
  return useQuery(
    QUERY_KEYS.stats(type, timeframe, assetSymbol),
    async () => {
      const res =
        type === "volume"
          ? await getStats(timeframe, assetSymbol)()
          : await getStatsTvl(assetSymbol)()

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
      `https://api.hydradx.io/hydradx-ui/v1/stats/volume/${assetSymbol ?? ""}${
        timeframe ? `?timeframe=${timeframe}` : ""
      }`,
    )

    const data: Promise<StatsData[]> = res.json()

    return data
  }

const getStatsTvl = (assetSymbol?: string) => async () => {
  const res = await fetch(
    `https://api.hydradx.io/hydradx-ui/v1/stats/tvl/${assetSymbol ?? ""}`,
  )

  const data: Promise<StatsData[]> = res.json()

  return data
}
