import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import {
  SProgressContainer,
  SProgressTime,
  SProgressBar,
  SProgressBarValue,
} from "./ReviewTransactionProgress.styled"
import { useState } from "react"
import { LazyMotion, domAnimation } from "framer-motion"

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
    <LazyMotion features={domAnimation}>
      <SProgressContainer>
        <Text fs={12} fw={400} color="white" tAlign="center">
          <Trans
            i18nKey="liquidity.reviewTransaction.modal.success.timer"
            t={t}
            tOptions={{ value }}
          >
            <SProgressTime />
          </Trans>
        </Text>
        <SProgressBar
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
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
    </LazyMotion>
  )
}
