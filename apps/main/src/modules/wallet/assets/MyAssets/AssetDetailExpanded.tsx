import { Amount, Flex, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailExpanded: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)
  const [reservedDcaDisplayPrice] = useDisplayAssetPrice(
    asset.id,
    asset.reservedDca,
  )

  return (
    <Flex px={50} justify="space-around">
      <Amount
        label={t("myAssets.expandedAsset.assetOrigin")}
        value={
          asset.origin?.name
            ? t("myAssets.expandedAsset.customOrigin", {
                origin: asset.origin.name,
              })
            : t("common:unknown")
        }
        sx={{ alignSelf: "center" }}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reserved")}
        value={t("common:currency", {
          value: asset.reserved,
          symbol: asset.symbol,
        })}
        displayValue={reservedDisplayPrice}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reservedDca")}
        value={t("common:currency", {
          value: asset.reservedDca,
          symbol: asset.symbol,
        })}
        displayValue={reservedDcaDisplayPrice}
      />
    </Flex>
  )
}
