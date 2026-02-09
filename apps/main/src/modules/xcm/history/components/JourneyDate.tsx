import { Text, TextProps, Tooltip } from "@galacticcouncil/ui/components"
import { differenceInHours } from "date-fns"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

import { TimeAgo } from "@/components/TimeAgo"

export type JourneyDateProps = TextProps & {
  timestamp: number
}

export const JourneyDate: React.FC<JourneyDateProps> = ({
  timestamp,
  ...props
}) => {
  const { t } = useTranslation(["common"])

  const now = useRef(new Date()).current
  const date = useRef(new Date(timestamp)).current
  const hoursAgo = differenceInHours(now, date)

  const isWithin24Hours = hoursAgo < 24

  if (isWithin24Hours) {
    return (
      <Tooltip text={t("date.datetime", { value: date })} side="left">
        <TimeAgo date={date} {...props} />
      </Tooltip>
    )
  }

  return <Text {...props}>{t("date.datetime.short", { value: date })}</Text>
}
