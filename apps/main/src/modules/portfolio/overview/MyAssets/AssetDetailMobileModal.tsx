import { Flex, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { AssetDetailMobileActions } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalances } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModalBalances"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailTotal } from "@/modules/portfolio/overview/MyAssets/AssetDetailTotal"
import { AssetOrigin } from "@/modules/portfolio/overview/MyAssets/AssetOrigin"
import {
  AssetDetailModal,
  MyAsset,
} from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"

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
        customTitle={<AssetLabelFull asset={asset} size="primary" />}
      />
      <SAssetDetailModalBody>
        <Flex direction="column" gap="base">
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

        <AssetDetailMobileModalBalances asset={asset} />
        <AssetDetailMobileActions asset={asset} onModalOpen={onModalOpen} />
      </SAssetDetailModalBody>
    </>
  )
}
