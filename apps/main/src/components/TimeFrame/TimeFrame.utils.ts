import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInMinute,
  millisecondsInWeek,
} from "date-fns/constants"
import { z } from "zod"

import i18n from "@/i18n"
import { validNumber } from "@/utils/validators"

export const timeFrameTypes = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
] as const

export type TimeFrameType = (typeof timeFrameTypes)[number]

export const timeFrameSchema = z
  .object({
    value: validNumber.gt(0, { error: i18n.t("error.timeFrame") }).nullable(),
    type: z.enum(timeFrameTypes),
  })
  .refine(
    ({ type, value }) => {
      const millis = TIME_FRAME_MS[type] * (value ?? 0)

      return !isNaN(new Date(Date.now() + millis).valueOf())
    },
    { error: i18n.t("error.timeFrame"), path: ["value"] },
  )

export type TimeFrame = z.infer<typeof timeFrameSchema>

export const TIME_FRAME_MS: Record<TimeFrameType, number> = {
  minute: millisecondsInMinute,
  hour: millisecondsInHour,
  day: millisecondsInDay,
  week: millisecondsInWeek,
  month: millisecondsInDay * 30.5,
}

export const getTimeFrameMillis = (timeFrame: TimeFrame): number =>
  timeFrame.value ? timeFrame.value * TIME_FRAME_MS[timeFrame.type] : 0
