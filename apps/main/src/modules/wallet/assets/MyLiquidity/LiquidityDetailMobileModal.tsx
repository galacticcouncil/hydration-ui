import { Amount, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { SAssetDetailModalBody } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { LiquidityDetailMobileActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileActions"
import { LiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionsMobile"
import { MyLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly asset: TAsset
  readonly currentValue: string
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const LiquidityDetailMobileModal: FC<Props> = ({
  asset,
  currentValue,
  positions,
}) => {
  const { t } = useTranslation(["wallet", "common"])

  const [currentValueDisplay] = useDisplayAssetPrice(asset.id, currentValue)

  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset.symbol ?? ""}
        description={asset.name}
      />
      <SAssetDetailModalBody>
        <Amount
          label={t("myLiquidity.header.currentValue")}
          value={t("common:number", {
            value: currentValue,
          })}
          displayValue={currentValueDisplay}
        />
        <SAssetDetailMobileSeparator />
        <LiquidityDetailMobileActions assetId={asset.id} />
        <SAssetDetailMobileSeparator />
        <LiquidityPositionsMobile asset={asset} positions={positions} />
      </SAssetDetailModalBody>
    </>
  )
}
