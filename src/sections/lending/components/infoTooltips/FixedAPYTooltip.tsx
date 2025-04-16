import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { GHO_SYMBOL } from "sections/lending/utils/ghoUtilities"

export const FixedAPYTooltip = () => {
  const { t } = useTranslation()
  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          {t("lending.tooltip.fixedAPYTooltip", {
            symbol: GHO_SYMBOL,
          })}
        </Text>
      }
    />
  )
}
