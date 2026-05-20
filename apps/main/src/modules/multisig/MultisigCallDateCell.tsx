import {
  Skeleton,
  Text,
  TextProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { differenceInHours } from "date-fns"
import { useRef } from "react"
import { useTranslation } from "react-i18next"

import { RelativeDateText } from "@/components/RelativeDateText"

type Props = TextProps & {
  timestamp: number | null
  isLoading?: boolean
}

export const MultisigCallDateCell: React.FC<Props> = ({
  timestamp,
  isLoading,
  ...props
}) => {
  const { t } = useTranslation(["common"])
  const now = useRef(new Date()).current

  if (isLoading) {
    return <Skeleton sx={{ width: "3xl" }} />
  }
  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp)
  const hoursAgo = differenceInHours(now, date)
  const isWithin24Hours = hoursAgo < 24

  if (isWithin24Hours) {
    return (
      <Tooltip text={t("date.datetime", { value: date })} side="left">
        <RelativeDateText shortFormat date={date} {...props} />
      </Tooltip>
    )
  }

  return <Text {...props}>{t("date.datetime.short", { value: date })}</Text>
}
