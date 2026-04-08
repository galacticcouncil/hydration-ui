import { Landmark } from "@galacticcouncil/ui/assets/icons"
import { Amount } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailMobileModalBalances: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  return (
    <>
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.transferrable")}
        value={t("common:number", {
          value: asset.transferable,
        })}
        displayValue={t("common:currency", {
          value: asset.transferableDisplay,
        })}
      />
      <SAssetDetailMobileSeparator />
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDCA")}
        labelIcon={Landmark}
        value={t("common:number", {
          value: asset.reserved,
        })}
        displayValue={reservedDisplayPrice}
      />
    </>
  )
}
