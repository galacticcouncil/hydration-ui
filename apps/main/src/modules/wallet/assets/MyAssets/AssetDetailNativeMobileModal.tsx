import { Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

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
        description={asset.name}
      />
      <SAssetDetailModalBody>
        <Flex justify="space-between" align="center">
          <AssetDetailTotal assetId={asset.id} total={asset.total} />
          <AssetDetailStaking asset={asset} />
        </Flex>
        <AssetDetailMobileActions asset={asset} onModalOpen={onModalOpen} />
        <div>
          <SAssetDetailMobileSeparator />
          <AssetDetailMobileModalBalancesHeader />
          <SAssetDetailMobileSeparator />
        </div>
        <AssetDetailNativeMobileModalBalances asset={asset} />
      </SAssetDetailModalBody>
    </>
  )
}
