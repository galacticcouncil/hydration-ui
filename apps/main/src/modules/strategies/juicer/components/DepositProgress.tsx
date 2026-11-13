import { AnimatedValue, Flex, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  PROGRESS_MOVE_MS,
  SFill,
  SProgress,
  STrack,
} from "@/modules/strategies/juicer/components/DepositProgress.styled"

type Props = {
  readonly label: string
  // 0..1
  readonly progress: number
}

const width = (fraction: number) =>
  `${Math.min(1, Math.max(0, fraction)) * 100}%`

// A striped bar with the status above it on the left and the percent on the
// right; the percent counts to its new value. Copied from the looper's
// MultiplyProgress, without leverage.
export const DepositProgress: FC<Props> = ({ label, progress }) => {
  const { t } = useTranslation("common")

  return (
    <SProgress>
      <Flex justify="space-between" align="baseline" gap="m">
        <Text fs="p6" fw={500} whiteSpace="nowrap">
          {label}
        </Text>
        <Text fs="p6" fw={500} whiteSpace="nowrap">
          <AnimatedValue
            value={progress}
            duration={PROGRESS_MOVE_MS}
            format={(value) =>
              t("percent", { value: value * 100, maximumFractionDigits: 0 })
            }
          />
        </Text>
      </Flex>
      <STrack
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <SFill style={{ width: width(progress) }} />
      </STrack>
    </SProgress>
  )
}
