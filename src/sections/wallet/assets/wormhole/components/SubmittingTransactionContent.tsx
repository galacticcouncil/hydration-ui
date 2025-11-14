import { Spinner } from "components/Spinner/Spinner"
import { Heading } from "components/Typography/Heading/Heading"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const SubmittingTransactionContent = () => {
  const { t } = useTranslation()
  return (
    <div
      sx={{
        flex: "column",
        align: "center",
        py: [200, 50],
        gap: 10,
        minHeight: "100%",
        width: "100%",
      }}
    >
      <Spinner size={135} />
      <Heading fs={19} fw={500} tAlign="center" sx={{ mt: 20 }}>
        {t("liquidity.reviewTransaction.modal.confirmButton.loading")}
      </Heading>
      <Text tAlign="center" fs={16} color="basic400" fw={400} lh={22}>
        {t("liquidity.reviewTransaction.modal.confirmButton.warning")}
      </Text>
    </div>
  )
}
