import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { ReactComponent as SuccessIcon } from "assets/icons/SuccessIcon.svg"
import { useTranslation } from "react-i18next"
import { ReviewTransactionProgress } from "./ReviewTransactionProgress"
import { Spacer } from "components/Spacer/Spacer"

export const ReviewTransactionSuccess = (props: { onClose: () => void }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", align: "center" }}>
      <SuccessIcon />
      <GradientText fs={24} fw={600} tAlign="center" sx={{ mt: 20 }}>
        {t("pools.reviewTransaction.modal.success.title")}
      </GradientText>
      <div sx={{ flex: "column", align: "center", px: 20, mt: 20 }}>
        <Text tAlign="center" fs={16} color="neutralGray200" fw={400} lh={22}>
          {t("pools.reviewTransaction.modal.success.description")}
        </Text>

        <Button variant="secondary" sx={{ mt: 40 }} onClick={props.onClose}>
          {t("pools.reviewTransaction.modal.success.close")}
        </Button>
      </div>

      <Spacer size={40} />

      <ReviewTransactionProgress duration={3} onComplete={props.onClose} />
    </div>
  )
}
