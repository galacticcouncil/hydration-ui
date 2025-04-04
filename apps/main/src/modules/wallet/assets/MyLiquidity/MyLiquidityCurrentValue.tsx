import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { WalletLiquidityCurrentValue } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly label?: string
  readonly currentValue: WalletLiquidityCurrentValue
}

export const MyLiquidityCurrentValue: FC<Props> = ({ label, currentValue }) => {
  const { t } = useTranslation()

  const [displayPrice] = useDisplayAssetPrice(
    currentValue.asset1Id,
    currentValue.balance,
  )

  const { getAsset } = useAssets()
  const asset1 = getAsset(currentValue.asset1Id)
  const asset2 = getAsset(currentValue.asset2Id)

  const asset1Amount = scaleHuman(
    currentValue.asset1Amount,
    asset1?.decimals ?? 12,
  )
  const asset1Symbol = asset1?.symbol ?? ""
  const asset2Amount = scaleHuman(
    currentValue.asset2Amount,
    asset2?.decimals ?? 12,
  )
  const asset2Symbol = asset2?.symbol ?? ""

  return (
    <Amount
      label={label}
      value={`${t("currency", {
        value: asset1Amount,
        symbol: asset1Symbol,
      })} | ${t("currency", {
        value: asset2Amount,
        symbol: asset2Symbol,
      })}`}
      displayValue={displayPrice}
    />
  )
}
