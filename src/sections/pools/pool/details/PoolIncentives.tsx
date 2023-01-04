import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

// Easy fix until we get farms from the BE
const hideFarms = true

export const PoolIncentives = () => {
  const { t } = useTranslation()

  if (hideFarms) {
    return <div />
  }

  return (
    <div sx={{ minWidth: 200 }}>
      <Text fs={13} color="basic400">
        {t("liquidity.asset.incentives.title")}
      </Text>
    </div>
  )
}
