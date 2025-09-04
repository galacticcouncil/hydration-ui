import { subMonths, subYears } from "date-fns"

export const apyChartTimeRangeOptions = ["1M", "6M", "1Y"] as const
export type ApyChartTimeRangeOption = (typeof apyChartTimeRangeOptions)[number]

export const getApyChartTimeRange = (option: ApyChartTimeRangeOption) => {
  const now = new Date()

  const from = ((): Date => {
    switch (option) {
      case "1Y":
        return subYears(now, 1)
      case "6M":
        return subMonths(now, 6)
      case "1M":
        return subMonths(now, 1)
    }
  })()

  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}
