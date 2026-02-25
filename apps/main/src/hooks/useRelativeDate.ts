import { differenceInSeconds } from "date-fns"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useHarmonicIntervalFn } from "react-use"

export function useRelativeDate(date: Date) {
  const { t } = useTranslation("common")

  const [dateString, setDateString] = useState(() =>
    t("date.relative", { value: date }),
  )

  useHarmonicIntervalFn(() => {
    setDateString(t("date.relative", { value: date }))
  }, getUpdateInterval(date))

  return dateString
}

function getUpdateInterval(date: Date) {
  const secondsDiff = differenceInSeconds(new Date(), date)
  return secondsDiff < 60 ? millisecondsInSecond : millisecondsInMinute
}
