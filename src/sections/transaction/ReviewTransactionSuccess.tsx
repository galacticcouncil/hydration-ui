import { useState } from "react"
import { Text } from "components/Typography/Text/Text"
import { Box } from "components/Box/Box"
import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { Trans, useTranslation } from "react-i18next"
import {
  SProgressContainer,
  SProgressTime,
  SProgressBar,
  SProgressBarValue,
} from "./ReviewTransactionSuccess.styled"

export const ReviewTransactionSuccess = (props: { onClose: () => void }) => {
  const { t } = useTranslation()
  const [sec, setSec] = useState(3)
  const updateSeconds = (percentage: string) => {
    const newSec = Math.round(
      (Number.parseFloat(percentage.slice(0, -1)) / 100) * 3,
    )

    if (sec !== newSec) {
      setSec(newSec)
    }
  }

  return (
    <Box flex align="center" column>
      <SuccessIcon />
      <GradientText mt={20} fs={24} fw={600} tAlign="center">
        {t("pools.reviewTransaction.modal.success.title")}
      </GradientText>
      <Box flex column acenter pl={20} pr={20} mt={20} mb={40}>
        <Text tAlign="center" fs={16} color="neutralGray200" fw={400} lh={22}>
          {t("pools.reviewTransaction.modal.success.description")}
        </Text>

        <Button variant="secondary" mt={40} onClick={props.onClose}>
          {t("pools.reviewTransaction.modal.success.close")}
        </Button>
      </Box>

      <SProgressContainer>
        <Text fs={12} fw={400} color="primary100" tAlign="center">
          <Trans
            i18nKey="pools.reviewTransaction.modal.success.timer"
            t={t}
            tOptions={{ value: sec }}
          >
            <SProgressTime />
          </Trans>
        </Text>
        <SProgressBar
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 3 }}
          onUpdate={(latest) => {
            if (typeof latest.width === "string") {
              updateSeconds(latest.width)
            }
          }}
          onAnimationComplete={() => props.onClose()}
        >
          <SProgressBarValue />
        </SProgressBar>
      </SProgressContainer>
    </Box>
  )
}
