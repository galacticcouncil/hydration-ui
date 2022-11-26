import { Text } from "components/Typography/Text/Text"
import { Spinner } from "components/Spinner/Spinner.styled"
import { useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import { Heading } from "components/Typography/Heading/Heading"

type Props = {
  onClose: () => void
}

export const ReviewTransactionPending = ({ onClose }: Props) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "column", align: "center", pt: 50 }}>
      <Spinner css={{ width: 135, height: 135 }} />
      <Heading fs={19} fw={500} tAlign="center" sx={{ mt: 20 }}>
        {t("pools.reviewTransaction.modal.pending.title")}
      </Heading>
      <div sx={{ px: 20, mt: 20, mb: 40 }}>
        <Text tAlign="center" fs={16} color="basic400" fw={400} lh={22}>
          {t("pools.reviewTransaction.modal.pending.description")}
        </Text>
      </div>
      <Button variant="primary" sx={{ mt: 40 }} onClick={onClose}>
        {t("pools.reviewTransaction.modal.success.close")}
      </Button>
    </div>
  )
}
