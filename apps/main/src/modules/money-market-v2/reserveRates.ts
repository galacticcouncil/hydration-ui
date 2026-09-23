import { queryOptions } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { Address, getAddress } from "viem"

import { fetchGrafana } from "@/api/grafana/fetchGrafana"
import {
  ApyChartTimeRangeOption,
  getApyChartTimeRange,
} from "@/modules/borrow/reserve/components/ApyChart.utils"

import reserveRates from "./reserveRates.sql?raw"

type ApiResponse = readonly [
  timestamps: Array<number>,
  supplyRates: Array<number>,
  borrowRates: Array<number>,
]

/** One sampled rate, in percent; Grafana reports the timestamp in milliseconds. */
export type RatePoint = { readonly timestamp: number; readonly rate: number }

const zipRates = (timestamps: number[], rates: number[]): RatePoint[] =>
  timestamps.flatMap((timestamp, index) => {
    const rate = rates[index]
    return rate === undefined || rate <= 0 ? [] : [{ timestamp, rate }]
  })

/**
 * A reserve's supply and variable borrow APR history, as the pool emitted it.
 *
 * Unlike v1's query this one is scoped to the pool as well as the reserve: one
 * address is a reserve of several markets (Hollar is in all of them), and the
 * events of every pool land in the same table.
 */
export const reserveRatesQuery = (
  pool: Address,
  reserve: Address,
  timeRange: ApyChartTimeRangeOption,
) =>
  queryOptions({
    queryKey: ["grafana", "mmv2", "reserveRates", pool, reserve, timeRange],
    staleTime: minutesToMilliseconds(5),
    queryFn: async ({ signal }) => {
      const { from, to } = getApyChartTimeRange(timeRange)
      const [timestamps, supply, borrow] = (await fetchGrafana(
        reserveRates
          // the indexer stores the emitting pool lowercased, the reserve checksummed
          .replace("$pool", pool.toLowerCase())
          .replace("$reserve", getAddress(reserve))
          .replace("$from", from)
          .replace("$to", to),
        "price",
        signal,
      )) as ApiResponse

      return {
        supply: zipRates(timestamps, supply),
        borrow: zipRates(timestamps, borrow),
      }
    },
  })
