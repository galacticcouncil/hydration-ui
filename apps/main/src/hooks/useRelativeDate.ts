import { differenceInSeconds } from "date-fns"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useHarmonicIntervalFn } from "react-use"

type UseRelativeDateOptions = {
  shortFormat?: boolean
}

export function useRelativeDate(
  date: Date,
  { shortFormat = false }: UseRelativeDateOptions = {},
) {
  const { t } = useTranslation("common")
  const [, setTick] = useState(0)

  useHarmonicIntervalFn(() => {
    setTick((tick) => tick + 1)
  }, getUpdateInterval(date))

  return t(shortFormat ? "date.relative.short" : "date.relative", {
    value: date,
  })
}

function getUpdateInterval(date: Date) {
  const secondsDiff = differenceInSeconds(new Date(), date)
  return secondsDiff < 60 ? millisecondsInSecond : millisecondsInMinute
}
