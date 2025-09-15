import { useTranslation } from "react-i18next"

import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { TAsset } from "providers/assets"

export type TransferAmountColumnProps = {
  asset: TAsset
  amount: string
}

export const TransferAmountColumn: React.FC<TransferAmountColumnProps> = ({
  asset,
  amount,
}) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "row", gap: 8, align: "center" }}>
      <Icon size={24} icon={<AssetLogo id={asset.id} />} />
      {t("value.tokenWithSymbol", {
        value: amount,
        symbol: asset.symbol,
      })}
    </div>
  )
}
