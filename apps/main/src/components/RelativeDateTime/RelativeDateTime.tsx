import { differenceInSeconds } from "date-fns"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useHarmonicIntervalFn } from "react-use"

export type RelativeDateTimeProps = {
  date: Date
}

export const RelativeDateTime: React.FC<RelativeDateTimeProps> = ({ date }) => {
  const { t } = useTranslation(["common"])

  useHarmonicIntervalFn(() => {
    setDateString(t("date.relative", { value: date }))
  }, getInterval(date))

  const [dateString, setDateString] = useState(() =>
    t("date.relative", { value: date }),
  )

  return dateString
}

function getInterval(date: Date) {
  const currentTime = new Date()
  const secondsDiff = differenceInSeconds(currentTime, date)

  return secondsDiff < 60 ? millisecondsInSecond : millisecondsInMinute
}
