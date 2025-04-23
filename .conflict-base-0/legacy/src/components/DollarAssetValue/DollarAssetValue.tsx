import { EmotionJSX } from "@emotion/react/types/jsx-namespace"
import BN from "bignumber.js"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useDisplayAssetStore } from "utils/displayAsset"

type Props = {
  value: BN
  children: string | ReactNode
  wrapper: (children: string | ReactNode) => EmotionJSX.Element
}

export const DollarAssetValue = ({ value, children, wrapper }: Props) => {
  const displayAsset = useDisplayAssetStore()
  const { t } = useTranslation()

  return !value?.isNaN() ? (
    wrapper(children)
  ) : (
    <InfoTooltip text={t("wallet.assets.table.details.noprice.tooltip")}>
      {wrapper(`${displayAsset.symbol} ⎯`)}
    </InfoTooltip>
  )
}
