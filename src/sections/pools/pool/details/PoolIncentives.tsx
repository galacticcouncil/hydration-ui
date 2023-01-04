import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const PoolIncentives = () => {
  const { t } = useTranslation()
  return (
    <div sx={{ minWidth: 200 }}>
      <Text fs={13} color="basic400">
        {t("liquidity.asset.incentives.title")}
      </Text>
    </div>
  )
}
