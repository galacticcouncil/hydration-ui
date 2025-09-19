import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const WalletStrategyTitle: FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <Text font="GeistMono" fs={28} lh="1.2" sx={{ mb: 12 }}>
        {t("wallet.strategy.title")}
      </Text>
      <Text fs={14} color="whiteish500">
        {t("wallet.strategy.description")}
      </Text>
    </div>
  )
}
