import { PeriodType } from "@/components/PeriodInput/PeriodInput"

export const SECOND_MS = 1000
export const MINUTE_MS = SECOND_MS * 60
export const HOUR_MS = MINUTE_MS * 60
export const DAY_MS = HOUR_MS * 24
export const WEEK_MS = DAY_MS * 7
export const MONTH_MS = DAY_MS * 30

export const INTERVAL_DCA_MS: Record<PeriodType, number> = {
  hour: HOUR_MS,
  day: DAY_MS,
  week: WEEK_MS,
  month: MONTH_MS,
}
