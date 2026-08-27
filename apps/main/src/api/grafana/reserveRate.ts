import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"

import { fetchGrafana } from "@/api/grafana/fetchGrafana"
import {
  ApyChartTimeRangeOption,
  getApyChartTimeRange,
} from "@/modules/borrow/reserve/components/ApyChart.utils"

import reserveRate from "./reserveRate.sql?raw"

type ApiResponse = readonly [
  timestamps: Array<number>,
  supplyRates: Array<number>,
  borrowRates: Array<number>,
]

export type ReserveApyRate = {
  readonly timestamp: number
  readonly rate: number
}

export type ReserveRateChartData = {
  readonly supply: ReserveApyRate[]
  readonly borrow: ReserveApyRate[]
}

const zipRates = (
  timestamps: Array<number>,
  rates: Array<number>,
): ReserveApyRate[] =>
  timestamps.flatMap((timestamp, index) => {
    const rate = rates[index]
    if (rate === undefined || rate <= 0) return []
    return [{ timestamp, rate }]
  })

export const reserveRateChartDataQuery = (
  assetId: string,
  timeRange: ApyChartTimeRangeOption,
) =>
  queryOptions({
    queryKey: ["grafana", "reserveRate", assetId, timeRange] as const,
    staleTime: minutesToMilliseconds(5),
    queryFn: async ({ signal }) => {
      const { from, to } = getApyChartTimeRange(timeRange)
      const assetAddress = getAddressFromAssetId(assetId)
      const data = (await fetchGrafana(
        reserveRate
          .replace("$assetId", assetAddress)
          .replace("$from", from)
          .replace("$to", to),
        "price",
        signal,
      )) as ApiResponse

      return {
        supply: zipRates(data[0], data[1]),
        borrow: zipRates(data[0], data[2]),
      } satisfies ReserveRateChartData
    },
  })

export const supplyRateChartDataQuery = (
  assetId: string,
  timeRange: ApyChartTimeRangeOption,
) =>
  queryOptions({
    ...reserveRateChartDataQuery(assetId, timeRange),
    select: (data) => data.supply,
  })

export const variableBorrowRateChartDataQuery = (
  assetId: string,
  timeRange: ApyChartTimeRangeOption,
) =>
  queryOptions({
    ...reserveRateChartDataQuery(assetId, timeRange),
    select: (data) => data.borrow,
  })
