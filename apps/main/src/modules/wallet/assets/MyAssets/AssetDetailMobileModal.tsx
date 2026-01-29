import { Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalances } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalances"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailTotal } from "@/modules/wallet/assets/MyAssets/AssetDetailTotal"
import { AssetOrigin } from "@/modules/wallet/assets/MyAssets/AssetOrigin"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly onModalOpen: (action: AssetDetailModal) => void
}

export const AssetDetailMobileModal: FC<Props> = ({ asset, onModalOpen }) => {
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
          <AssetDetailTotal assetId={asset.id} total={asset.total} />
        </Flex>
        {asset.origin?.name && (
          <>
            <SAssetDetailMobileSeparator />
            <AssetOrigin origin={asset.origin} />
          </>
        )}
        <div>
          <SAssetDetailMobileSeparator />
          <AssetDetailMobileModalBalancesHeader />
          <SAssetDetailMobileSeparator />
        </div>
        <AssetDetailMobileModalBalances
          assetId={asset.id}
          reserved={asset.reserved}
          reservedDca={asset.reservedDca}
        />
        <AssetDetailMobileActions asset={asset} onModalOpen={onModalOpen} />
      </SAssetDetailModalBody>
    </>
  )
}
