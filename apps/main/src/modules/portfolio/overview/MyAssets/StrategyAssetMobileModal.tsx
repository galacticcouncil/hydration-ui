import { Amount, ModalHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import {
  StrategyPositionActions,
  StrategyPositionLabel,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.columns"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { MyStrategiesDetails } from "@/modules/portfolio/overview/MyStrategies/MyStrategiesDetails"

export const StrategyAssetMobileModal = ({
  asset,
  position,
  onTransfer,
}: {
  asset: MyAsset
  position: StrategyPosition
  onTransfer: () => void
}) => {
  const { t } = useTranslation(["wallet", "common"])
  return (
    <>
      <ModalHeader
        title={asset.symbol}
        customTitle={<StrategyPositionLabel position={position} />}
      />
      <SAssetDetailModalBody>
        <Amount
          label={t("myAssets.header.total")}
          value={t("common:number", { value: asset.total })}
          displayValue={t("common:currency", { value: asset.totalDisplay })}
        />
        <SAssetDetailMobileSeparator />
        <Amount
          variant="horizontalLabel"
          label={t("myAssets.header.transferable")}
          value={
            asset.strategyTransferableKnown
              ? t("common:number", { value: asset.transferable })
              : "—"
          }
          displayValue={
            asset.transferableDisplay
              ? t("common:currency", { value: asset.transferableDisplay })
              : undefined
          }
        />
        <SAssetDetailMobileSeparator />
        <MyStrategiesDetails position={position} showMainMetrics mobile />
        <StrategyPositionActions
          position={position}
          mobile
          onTransfer={onTransfer}
        />
      </SAssetDetailModalBody>
    </>
  )
}
