import {
  SContainer,
  SCountdownDivider,
  SNum,
  SNumContainer,
} from "./Countdown.styled"
import React, { memo, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTimer } from "react-timer-hook"
import { Text } from "components/Typography/Text/Text"

export type CountdownProps = {
  ts: number
  className?: string
  expiredMessage?: React.ReactNode
}

export const Countdown: React.FC<CountdownProps> = memo(
  ({ ts, className, expiredMessage }) => {
    const { t } = useTranslation()
    const [expired, setExpired] = useState(false)

    const date = useMemo(
      () => (typeof ts === "number" ? new Date(ts) : new Date()),
      [ts],
    )

    const { seconds, minutes, hours, days } = useTimer({
      expiryTimestamp: date,
      onExpire: () => setExpired(true),
    })

    const hoursTotal = days * 24 + hours

    return (
      <SContainer className={className}>
        {expired && (
          <SContainer css={{ position: "absolute" }}>
            <Text color="brightBlue300" fs={18} tAlign="center">
              {expiredMessage}
            </Text>
          </SContainer>
        )}
        <SContainer sx={{ opacity: expired ? 0 : 1 }}>
          <SNumContainer>
            {padNumArray(hoursTotal).map((n) => (
              <SNum>{n}</SNum>
            ))}
            <Text>{t("hours")}</Text>
          </SNumContainer>
          <SCountdownDivider />
          <SNumContainer>
            {padNumArray(minutes).map((n) => (
              <SNum>{n}</SNum>
            ))}
            <Text>{t("minutes")}</Text>
          </SNumContainer>
          <SCountdownDivider />
          <SNumContainer>
            {padNumArray(seconds).map((n) => (
              <SNum>{n}</SNum>
            ))}
            <Text>{t("seconds")}</Text>
          </SNumContainer>
        </SContainer>
      </SContainer>
    )
  },
)

function padNumArray(n: number) {
  return n.toString().padStart(2, "0").split("")
}
