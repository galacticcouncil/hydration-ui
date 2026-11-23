import {
  AnimatedValue,
  Flex,
  ProgressBar,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

// the numbers count over the same 900ms the bar's width takes to move
const PROGRESS_MOVE_MS = 900

type Props = {
  readonly label: string
  // 0..1
  readonly progress: number
  readonly leverage: number
}

// Ladder progress: a striped bar with the status and percent above it, and the
// current leverage on the right. Both numbers count to their new value.
export const MultiplyProgress: FC<Props> = ({ label, progress, leverage }) => {
  const { t } = useTranslation(["strategies", "common"])

  return (
    <Flex direction="column" width={pxToRem(160)}>
      <Flex justify="space-between" align="baseline" gap="m">
        <Text
          fs="p6"
          fw={500}
          whiteSpace="nowrap"
          color={getToken("text.high")}
        >
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
        <Text fs="p6" fw={500} whiteSpace="nowrap" color={getToken("text.low")}>
          <AnimatedValue
            value={leverage}
            duration={PROGRESS_MOVE_MS}
            format={(value) => t("cards.multiply.leverage", { value })}
          />
        </Text>
      </Flex>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <ProgressBar
          value={progress * 100}
          variant="gradient"
          animated
          size="medium"
          hideLabel
        />
      </div>
    </Flex>
  )
}
