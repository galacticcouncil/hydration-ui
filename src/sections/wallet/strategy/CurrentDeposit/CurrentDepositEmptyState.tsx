import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const CurrentDepositEmptyState: FC = () => {
  const { t } = useTranslation()

  return (
    <Text fs={[13, 14]} lh={["1.3", "1.4"]} color="basic100">
      {t("wallet.strategy.gigadot.emptyState")}
    </Text>
  )
}
