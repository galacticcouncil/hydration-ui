import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly label?: string
  readonly asset: TAsset
  readonly currentValue: string
}

export const MyLiquidityCurrentValue: FC<Props> = ({
  label,
  asset,
  currentValue,
}) => {
  const { t } = useTranslation()

  const [displayPrice] = useDisplayAssetPrice(asset.id, currentValue)

  return (
    <Amount
      label={label}
      value={t("currency", { value: currentValue, symbol: asset.symbol })}
      displayValue={displayPrice}
    />
  )
}
