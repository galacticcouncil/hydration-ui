import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { EmotionJSX } from "@emotion/react/types/jsx-namespace"

type Props = {
  value: BN
  children: string
  wrapper: (children: string) => EmotionJSX.Element
}

export const DollarAssetValue = ({ value, children, wrapper }: Props) => {
  const { t } = useTranslation()

  return !value.isNaN() ? (
    wrapper(children)
  ) : (
    <InfoTooltip text={t("wallet.assets.table.details.noprice.tooltip")}>
      {wrapper("$ ⎯")}
    </InfoTooltip>
  )
}
