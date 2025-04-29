import { durationInDaysAndHoursFromNow } from "@galacticcouncil/utils"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useTimer } from "@/hooks/useTimer"
import { LockExpiration } from "@/modules/wallet/assets/MyLiquidity/LockExpiration"

type Props = {
  readonly initialLockedSeconds: number
  readonly className?: string
}

export const FullExpiration: FC<Props> = ({
  initialLockedSeconds,
  className,
}) => {
  const { t } = useTranslation(["wallet"])

  const seconds = useTimer(initialLockedSeconds)
  const endDate = useMemo(
    () => durationInDaysAndHoursFromNow(seconds * 1000),
    [seconds],
  )

  return (
    <LockExpiration className={className}>
      {t("myAssets.expandedNative.fullExpiration", {
        relativeTime: endDate,
      })}
    </LockExpiration>
  )
}
