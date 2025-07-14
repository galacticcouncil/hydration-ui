import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInWeek,
} from "date-fns/constants"

import { Period, PeriodType } from "@/components/PeriodInput/PeriodInput"

export const PERIOD_MS: Record<PeriodType, number> = {
  hour: millisecondsInHour,
  day: millisecondsInDay,
  week: millisecondsInWeek,
  month: millisecondsInDay * 30,
}

export const getPeriodDuration = (period: Period) => {
  return period.value ? period.value * PERIOD_MS[period.type] : 0
}
