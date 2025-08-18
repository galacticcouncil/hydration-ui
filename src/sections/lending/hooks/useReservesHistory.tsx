import dayjs from "dayjs"

export enum ESupportedTimeRanges {
  OneMonth = "1m",
  SixMonths = "6m",
  OneYear = "1y",
}

export const reserveRateTimeRangeOptions = [
  ESupportedTimeRanges.OneMonth,
  ESupportedTimeRanges.SixMonths,
  ESupportedTimeRanges.OneYear,
]
export type ReserveRateTimeRange = (typeof reserveRateTimeRangeOptions)[number]

type RatesHistoryParams = {
  from: string
  to: string
}

export const resolutionForTimeRange = (
  timeRange: ReserveRateTimeRange,
): RatesHistoryParams => {
  const now = dayjs()
  switch (timeRange) {
    case ESupportedTimeRanges.OneMonth:
      return {
        from: now.subtract(30, "day").toISOString(),
        to: now.toISOString(),
      }
    case ESupportedTimeRanges.SixMonths:
      return {
        from: now.subtract(6, "month").toISOString(),
        to: now.toISOString(),
      }
    case ESupportedTimeRanges.OneYear:
      return {
        from: now.subtract(1, "year").toISOString(),
        to: now.toISOString(),
      }
    default:
      // Return today as a fallback
      return {
        from: now.toISOString(),
        to: now.toISOString(),
      }
  }
}
