import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import {
  SProgressContainer,
  SProgressTime,
  SProgressBar,
  SProgressBarValue,
} from "./ReviewTransactionProgress.styled"
import { useState } from "react"

export const ReviewTransactionProgress = (props: {
  duration: number
  onComplete: () => void
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState(props.duration)
  const updateSeconds = (percentage: string) => {
    const newSec = Math.round(
      (Number.parseFloat(percentage.slice(0, -1)) / 100) * props.duration,
    )

    if (value !== newSec) {
      setValue(newSec)
    }
  }

  return (
    <SProgressContainer>
      <Text fs={12} fw={400} color="primary100" tAlign="center">
        <Trans
          i18nKey="pools.reviewTransaction.modal.success.timer"
          t={t}
          tOptions={{ value }}
        >
          <SProgressTime />
        </Trans>
      </Text>
      <SProgressBar
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: props.duration }}
        onUpdate={(latest) => {
          if (typeof latest.width === "string") {
            updateSeconds(latest.width)
          }
        }}
        onAnimationComplete={props.onComplete}
      >
        <SProgressBarValue />
      </SProgressBar>
    </SProgressContainer>
  )
}
