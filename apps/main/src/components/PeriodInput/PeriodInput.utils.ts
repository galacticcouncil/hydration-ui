import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInMinute,
  millisecondsInWeek,
} from "date-fns/constants"
import { z } from "zod"

import i18n from "@/i18n"
import { validNumber } from "@/utils/validators"

export const periodTypes = ["minute", "hour", "day", "week", "month"] as const
export type PeriodType = (typeof periodTypes)[number]

export const periodInputSchema = z
  .object({
    value: validNumber.gt(0, { error: i18n.t("error.period") }).nullable(),
    type: z.enum(periodTypes),
  })
  .refine(
    ({ type, value }) => {
      const millis = PERIOD_MS[type] * (value ?? 0)

      return !isNaN(new Date(Date.now() + millis).valueOf())
    },
    { error: i18n.t("error.period"), path: ["value"] },
  )

export type Period = z.infer<typeof periodInputSchema>

export const PERIOD_MS: Record<PeriodType, number> = {
  minute: millisecondsInMinute,
  hour: millisecondsInHour,
  day: millisecondsInDay,
  week: millisecondsInWeek,
  month: millisecondsInDay * 30.5,
}

export const getPeriodDuration = (period: Period) => {
  return period.value ? period.value * PERIOD_MS[period.type] : 0
}
