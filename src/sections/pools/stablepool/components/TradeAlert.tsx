import { Alert } from "components/Alert/Alert"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const TradeAlert = () => {
  const { t } = useTranslation()

  return (
    <Alert variant="info">
      <Text fs={13} lh={16}>
        {t("liquidity.add.modal.trade.alert")}
      </Text>
    </Alert>
  )
}
