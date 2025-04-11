import { FC } from "react"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

export const WalletStrategyHeader: FC = () => {
  const { t } = useTranslation()

  return (
    <Text font="GeistMono" fs={28} lh="1.2" color="white">
      {t("wallet.strategy.title")}
    </Text>
  )
}
