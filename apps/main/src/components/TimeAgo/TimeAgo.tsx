import { Text, TextProps } from "@galacticcouncil/ui/components"
import { differenceInSeconds } from "date-fns"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useHarmonicIntervalFn } from "react-use"

export type TimeAgoProps = TextProps & {
  date: Date
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ date, ...props }) => {
  const { t } = useTranslation(["common"])

  const [dateString, setDateString] = useState(() =>
    t("date.relative", { value: date }),
  )

  useHarmonicIntervalFn(() => {
    setDateString(t("date.relative", { value: date }))
  }, getUpdateInterval(date))

  return <Text {...props}>{dateString}</Text>
}

function getUpdateInterval(date: Date) {
  const currentTime = new Date()
  const secondsDiff = differenceInSeconds(currentTime, date)
  return secondsDiff < 60 ? millisecondsInSecond : millisecondsInMinute
}
