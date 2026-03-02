import {
  millisecondsInDay,
  millisecondsInHour,
  millisecondsInMinute,
  millisecondsInWeek,
} from "date-fns/constants"
import { z } from "zod"

import i18n from "@/i18n"
import { validNumber } from "@/utils/validators"

const MAX_YEAR_FRAME = 1
const MAX_TIME_FRAME_MS = millisecondsInDay * MAX_YEAR_FRAME * 365

export const timeFrameTypes = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
] as const

export type TimeFrameType = (typeof timeFrameTypes)[number]

export const getTimeFrameSchema = <TType extends TimeFrameType>(
  types: ReadonlyArray<TType>,
) =>
  z
    .object({
      value: validNumber.gt(0, { error: i18n.t("error.timeFrame") }).nullable(),
      type: z.enum(types),
    })
    .refine(
      ({ type, value }) => {
        const millis = TIME_FRAME_MS[type] * (value ?? 0)
        return !millis || !isNaN(new Date(Date.now() + millis).valueOf())
      },
      { error: i18n.t("error.timeFrame"), path: ["value"] },
    )
    .superRefine((data, { addIssue }) => {
      const { type, value } = data
      const millis = TIME_FRAME_MS[type] * (value ?? 0)
      if (millis > MAX_TIME_FRAME_MS) {
        const maxInUnit = Math.floor(MAX_TIME_FRAME_MS / TIME_FRAME_MS[type])

        const valueFormatted = i18n.t(type as TimeFrameType, {
          count: maxInUnit,
        })
        addIssue({
          code: "custom",
          path: ["value"],
          message: i18n.t("error.timeFrameMax", { value: valueFormatted }),
        })
      }
    })

export const timeFrameSchema = getTimeFrameSchema(timeFrameTypes)

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
