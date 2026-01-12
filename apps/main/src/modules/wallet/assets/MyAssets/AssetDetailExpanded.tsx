import { Hourglass, Landmark } from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { AssetOrigin } from "@/modules/wallet/assets/MyAssets/AssetOrigin"
import { ExpandedRowSeparator } from "@/modules/wallet/assets/MyAssets/ExpandedRowSeparator"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailExpanded: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const [reservedDisplayPrice] = useDisplayAssetPrice(asset.id, asset.reserved)

  // TODO integrate
  const xcm = "-1"
  const [xcmDisplay] = useDisplayAssetPrice(asset.id, xcm)

  return (
    <Flex direction="column" gap={20}>
      {asset.origin?.name && (
        <>
          <AssetOrigin origin={asset.origin} />
          <ExpandedRowSeparator />
        </>
      )}
      <Amount
        variant="horizontalLabel"
        label={t("myAssets.expandedNative.lockedInDCA")}
        labelIcon={Landmark}
        value={t("common:number", {
          value: asset.reserved,
        })}
        displayValue={reservedDisplayPrice}
      />
      {xcm !== "-1" && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInXCM")}
            labelIcon={Hourglass}
            description={t("myAssets.expandedNative.lockedInXCM.description", {
              returnObjects: true,
            })}
            value={t("common:number", {
              value: xcm,
            })}
            displayValue={xcmDisplay}
          />
        </>
      )}
    </Flex>
  )
}
