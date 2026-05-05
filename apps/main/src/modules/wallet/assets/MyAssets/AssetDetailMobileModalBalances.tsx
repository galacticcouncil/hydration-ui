import { CoinsIcon, Landmark } from "@galacticcouncil/ui/assets/icons"
import { Amount } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TokenReserveType, useAccountTokenReserves } from "@/api/balances"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { MyAsset } from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly asset: MyAsset
}

export const AssetDetailMobileModalBalances: FC<Props> = ({ asset }) => {
  const { t } = useTranslation(["wallet", "common"])

  const { data: reserves } = useAccountTokenReserves(asset.id)
  const dca = reserves?.get(TokenReserveType.DCA) ?? 0n
  const otc = reserves?.get(TokenReserveType.OTC) ?? 0n
  const dcaAmountHuman = scaleHuman(dca, asset.decimals)
  const otcAmountHuman = scaleHuman(otc, asset.decimals)

  const { price: assetPrice } = useAssetPrice(asset.id)

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
          value: dcaAmountHuman,
        })}
        displayValue={t("common:currency", {
          value: Big(dcaAmountHuman).times(assetPrice).toString(),
        })}
      />
      {otc > 0n && (
        <>
          <SAssetDetailMobileSeparator />
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
    </>
  )
}
