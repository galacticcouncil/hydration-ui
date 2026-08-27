import { durationInDaysAndHoursFromNow } from "@galacticcouncil/utils"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useCountdown } from "@/hooks/useCountdown"
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"

type Props = {
  readonly initialLockedMilliseconds: number
  readonly className?: string
}

export const FullExpiration: FC<Props> = ({
  initialLockedMilliseconds,
  className,
}) => {
  const { t } = useTranslation(["wallet"])

  const milliseconds = useCountdown(initialLockedMilliseconds)

  const endDate = useMemo(
    () => durationInDaysAndHoursFromNow(milliseconds),
    [milliseconds],
  )

  return (
    <LockExpiration className={className}>
      {t("myAssets.expandedNative.fullExpiration", {
        relativeTime: endDate,
      })}
    </LockExpiration>
  )
}
