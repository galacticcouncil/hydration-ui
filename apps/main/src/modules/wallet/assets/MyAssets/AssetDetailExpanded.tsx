import { CoinsIcon, Landmark } from "@galacticcouncil/ui/assets/icons"
import { Amount, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TokenReserveType, useAccountTokenReserves } from "@/api/balances"
import { AssetOrigin } from "@/modules/wallet/assets/MyAssets/AssetOrigin"
import { ExpandedRowSeparator } from "@/modules/wallet/assets/MyAssets/ExpandedRowSeparator"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailExpanded: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const { data: reserves } = useAccountTokenReserves(asset.id)
  const dca = reserves?.get(TokenReserveType.DCA) ?? 0n
  const otc = reserves?.get(TokenReserveType.OTC) ?? 0n
  const dcaAmountHuman = scaleHuman(dca, asset.decimals)
  const otcAmountHuman = scaleHuman(otc, asset.decimals)

  const { price: assetPrice } = useAssetPrice(asset.id)

  // TODO integrate
  // const xcm = "-1"
  // const [xcmDisplay] = useDisplayAssetPrice(asset.id, xcm)

  return (
    <Flex direction="column" gap="xl">
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
          value: dcaAmountHuman,
        })}
        displayValue={t("common:currency", {
          value: Big(dcaAmountHuman).times(assetPrice).toString(),
        })}
      />
      {otc > 0n && (
        <>
          <ExpandedRowSeparator />
          <Amount
            variant="horizontalLabel"
            label={t("myAssets.expandedNative.lockedInOTC")}
            labelIcon={CoinsIcon}
            value={t("common:number", {
              value: otcAmountHuman,
            })}
            displayValue={t("common:currency", {
              value: Big(otcAmountHuman).times(assetPrice).toString(),
            })}
          />
        </>
      )}
      {/* {xcm !== "-1" && (
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
      )} */}
    </Flex>
  )
}
