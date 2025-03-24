import { Amount, Flex, Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
}

export const AssetDetailExpanded: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  const reserved = 2855.44
  const [reservedDisplayPrice] = useDisplayAssetPrice(assetId, reserved)

  const reservedDca = 2855.44
  const [reservedDcaDisplayPrice] = useDisplayAssetPrice(assetId, reservedDca)

  const assetOrigin = "AssetHub"

  return (
    <Flex px={50} justify="space-around">
      <Amount
        label={t("myAssets.expandedAsset.assetOrigin")}
        value={t("myAssets.expandedAsset.customOrigin", {
          origin: assetOrigin,
        })}
        sx={{ alignSelf: "center" }}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reserved")}
        value={t("common:currency", {
          value: reserved,
          symbol: asset?.symbol,
        })}
        displayValue={reservedDisplayPrice}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reservedDca")}
        value={t("common:currency", {
          value: reservedDca,
          symbol: asset?.symbol,
        })}
        displayValue={reservedDcaDisplayPrice}
      />
    </Flex>
  )
}
