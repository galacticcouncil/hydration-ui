import { grafanaQuery } from "api/grafana"
import { zipArrays } from "utils/rx"
import reserveRate from "./reserveRate.sql?raw"

type ApiResponse = readonly [
  timestamps: Array<number>,
  reserves: Array<string>,
  borrowRates: Array<number>,
]

export type SupplyRateChartDataItem = {
  readonly timestamp: number
  readonly supplyRate: number
}

export const getSupplyRateChartData = async (
  assetId: string,
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<Array<SupplyRateChartDataItem>> => {
  const data = (await grafanaQuery(
    reserveRate
      .replace("$rateParam", "liquidityRate")
      .replace("$assetId", assetId)
      .replace("$from", from)
      .replace("$to", to),
    "price",
    signal,
  )) as ApiResponse

  return zipArrays(data[0], data[2]).map<SupplyRateChartDataItem>(
    ([timestamp, supplyRate]) => ({
      timestamp,
      supplyRate,
    }),
  )
}
