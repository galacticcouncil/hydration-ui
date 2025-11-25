import { Amount, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SAssetDetailMobileSeparator } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { SAssetDetailModalBody } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { LiquidityDetailMobileActions } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileActions"
import { LiquidityPositionsMobile } from "@/modules/wallet/assets/MyLiquidity/LiquidityPositionsMobile"
import { LiquidityPositionByAsset } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

export const LiquidityDetailMobileModal: FC<LiquidityPositionByAsset> = ({
  meta,
  currentValueHuman,
  currentHubValueHuman,
  currentTotalDisplay,
  positions,
}) => {
  const { t } = useTranslation(["wallet", "common"])
  const format = useFormatOmnipoolPositionData()

  return (
    <>
      <ModalHeader sx={{ p: 16 }} title={meta.symbol} description={meta.name} />
      <SAssetDetailModalBody>
        <Amount
          value={format({ meta, currentValueHuman, currentHubValueHuman })}
          displayValue={t("common:currency", {
            value: currentTotalDisplay,
          })}
        />
        <SAssetDetailMobileSeparator />
        <LiquidityDetailMobileActions assetId={meta.id} />
        <SAssetDetailMobileSeparator />
        <LiquidityPositionsMobile asset={meta} positions={positions} />
      </SAssetDetailModalBody>
    </>
  )
}
