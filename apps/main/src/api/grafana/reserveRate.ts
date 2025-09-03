import { queryOptions } from "@tanstack/react-query"
import { zipWith } from "remeda"

import { fetchGrafana } from "@/api/grafana/fetchGrafana"

import reserveRate from "./reserveRate.sql?raw"

type ApiResponse = readonly [
  timestamps: Array<number>,
  reserves: Array<string>,
  rates: Array<number>,
]

export type ReserveApyRate = {
  readonly timestamp: number
  readonly rate: number
}

export const supplyRateChartDataQuery = (
  assetId: string,
  from: string,
  to: string,
) =>
  queryOptions({
    queryKey: ["grafana", "supplyRate", assetId, from, to],
    queryFn: async ({ signal }) => {
      const data = (await fetchGrafana(
        reserveRate
          .replace("$rateParam", "liquidityRate")
          .replace("$assetId", assetId)
          .replace("$from", from)
          .replace("$to", to),
        "price",
        signal,
      )) as ApiResponse

      return zipWith(
        data[0],
        data[2],
        (timestamp, rate): ReserveApyRate => ({
          timestamp,
          rate,
        }),
      )
    },
  })

export const variableBorrowRateChartDataQuery = (
  assetId: string,
  from: string,
  to: string,
) =>
  queryOptions({
    queryKey: ["grafana", "varriableBorrowRate", assetId, from, to],
    queryFn: async ({ signal }) => {
      const data = (await fetchGrafana(
        reserveRate
          .replace("$rateParam", "variableBorrowRate")
          .replace("$assetId", assetId)
          .replace("$from", from)
          .replace("$to", to),
        "price",
        signal,
      )) as ApiResponse

      return zipWith(
        data[0],
        data[2],
        (timestamp, rate): ReserveApyRate => ({
          timestamp,
          rate,
        }),
      )
    },
  })
