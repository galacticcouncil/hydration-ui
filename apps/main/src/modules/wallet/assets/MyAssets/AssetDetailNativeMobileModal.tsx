import { Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailNativeMobileModalBalances } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModalBalances"
import { AssetDetailStaking } from "@/modules/wallet/assets/MyAssets/AssetDetailStaking"
import { AssetDetailTotal } from "@/modules/wallet/assets/MyAssets/AssetDetailTotal"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

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
        customTitle={
          <AssetLabelFull asset={asset} size="primary" variant="vertical" />
        }
      />
      <SAssetDetailModalBody>
        <Flex direction="column" gap="base">
          <SAssetDetailMobileSeparator />
          <Flex justify="space-between" align="center">
            <AssetDetailTotal assetId={asset.id} total={asset.total} />
            <AssetDetailStaking asset={asset} />
          </Flex>
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
