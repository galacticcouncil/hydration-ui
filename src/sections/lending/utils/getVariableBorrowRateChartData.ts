import { grafanaQuery } from "api/grafana"
import { zipArrays } from "utils/rx"
import reserveRate from "./reserveRate.sql?raw"

type ApiResponse = readonly [
  timestamps: Array<number>,
  reserves: Array<string>,
  borrowRates: Array<number>,
]

export type VariableBorrowRateChartDataItem = {
  readonly timestamp: number
  readonly borrowRate: number
}

export const getVariableBorrowRateChartData = async (
  assetId: string,
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<Array<VariableBorrowRateChartDataItem>> => {
  const data = (await grafanaQuery(
    reserveRate
      .replace("$rateParam", "variableBorrowRate")
      .replace("$assetId", assetId)
      .replace("$from", from)
      .replace("$to", to),
    "price",
    signal,
  )) as ApiResponse

  return zipArrays(data[0], data[2]).map<VariableBorrowRateChartDataItem>(
    ([timestamp, borrowRate]) => ({
      timestamp,
      borrowRate,
    }),
  )
}
