import { Notification } from "@galacticcouncil/ui/components"
import { differenceInSeconds } from "date-fns"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useHarmonicIntervalFn } from "react-use"

import { ToastData } from "@/states/toasts"

export const NotificationToast: React.FC<ToastData> = ({
  variant,
  title,
  link,
  hint,
  dateCreated,
}) => {
  const { t } = useTranslation(["common"])

  const date = new Date(dateCreated)

  const [dateString, setDateString] = useState(() =>
    t("date.relative", { value: date }),
  )

  useHarmonicIntervalFn(() => {
    setDateString(t("date.relative", { value: date }))
  }, getInterval(date))

  return (
    <Notification
      sx={{ width: "100%" }}
      autoClose={false}
      variant={variant}
      content={title}
      dateString={dateString}
      link={link}
      hint={hint}
    />
  )
}

function getInterval(date: Date) {
  const currentTime = new Date()
  const secondsDiff = differenceInSeconds(currentTime, date)

  return secondsDiff < 60 ? millisecondsInSecond : millisecondsInMinute
}
