import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly reserved: string
  readonly reservedDca: string
}

export const AssetDetailMobileModalBalances: FC<Props> = ({
  assetId,
  reserved,
  reservedDca,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, reserved)
  const [reservedDcaDisplayPrice] = useDisplayAssetPrice(asset.id, reservedDca)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedAsset.reserved")}
        value={t("common:number", {
          value: reserved,
        })}
        displayValue={reservedDisplayPrice}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedAsset.reservedDca")}
        value={t("common:number", {
          value: reservedDca,
        })}
        displayValue={reservedDcaDisplayPrice}
      />
    </>
  )
}
