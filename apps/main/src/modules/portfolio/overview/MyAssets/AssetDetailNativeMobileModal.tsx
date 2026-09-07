import { Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetDetailMobileActions } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailNativeMobileModalBalances } from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModalBalances"
import { AssetDetailStaking } from "@/modules/portfolio/overview/MyAssets/AssetDetailStaking"
import { AssetDetailTotal } from "@/modules/portfolio/overview/MyAssets/AssetDetailTotal"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onModalOpen: (action: AssetDetailModal) => void
}

export const AssetDetailNativeMobileModal: FC<Props> = ({
  asset,
  onModalOpen,
}) => {
  return (
    <>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset.symbol}
        customTitle={<AssetLabelFull asset={asset} size="primary" />}
      />
      <SAssetDetailModalBody>
        <Flex justify="space-between" align="center">
          <AssetDetailTotal assetId={asset.id} total={asset.total} />
          <AssetDetailStaking asset={asset} />
        </Flex>

        <div>
          <SAssetDetailMobileSeparator />
          <AssetDetailMobileModalBalancesHeader />
          <SAssetDetailMobileSeparator />
        </div>
        <AssetDetailNativeMobileModalBalances asset={asset} />
        <AssetDetailMobileActions asset={asset} onModalOpen={onModalOpen} />
      </SAssetDetailModalBody>
    </>
  )
}
