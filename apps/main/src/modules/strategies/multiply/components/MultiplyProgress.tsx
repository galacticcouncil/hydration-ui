import { AnimatedValue, Flex, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  PROGRESS_MOVE_MS,
  SFill,
  SProgress,
  STrack,
} from "@/modules/strategies/multiply/components/MultiplyProgress.styled"

type Props = {
  readonly label: string
  // 0..1
  readonly progress: number
  readonly leverage: number
}

const width = (fraction: number) =>
  `${Math.min(1, Math.max(0, fraction)) * 100}%`

// Ladder progress: a striped bar with the status and percent above it, and the
// current leverage on the right. Both numbers count to their new value.
export const MultiplyProgress: FC<Props> = ({ label, progress, leverage }) => {
  const { t } = useTranslation(["strategies", "common"])

  return (
    <SProgress>
      <Flex justify="space-between" align="baseline" gap="m">
        <Text fs="p6" fw={500} whiteSpace="nowrap">
          {label}{" "}
          <AnimatedValue
            value={progress}
            duration={PROGRESS_MOVE_MS}
            format={(value) =>
              t("common:percent", {
                value: value * 100,
                maximumFractionDigits: 0,
              })
            }
          />
        </Text>
        <Text fs="p6" fw={500} whiteSpace="nowrap">
          <AnimatedValue
            value={leverage}
            duration={PROGRESS_MOVE_MS}
            format={(value) => t("cards.multiply.leverage", { value })}
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
