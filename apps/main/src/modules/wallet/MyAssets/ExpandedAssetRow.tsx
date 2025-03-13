import {
  Amount,
  AmountValue,
  Flex,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
}

export const ExpandedAssetRow: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("wallet")
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
        customValue={
          <AmountValue>
            {t("myAssets.expandedAsset.customOrigin", {
              origin: assetOrigin,
            })}
          </AmountValue>
        }
        // align on flexbox breaks separators with height auto
        sx={{ alignSelf: "center" }}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reserved")}
        value={reserved}
        valueSymbol={asset?.symbol}
        displayValue={reservedDisplayPrice}
      />
      <Separator orientation="vertical" />
      <Amount
        label={t("myAssets.expandedAsset.reservedDca")}
        value={reservedDca}
        valueSymbol={asset?.symbol}
        displayValue={reservedDcaDisplayPrice}
      />
    </Flex>
  )
}
