import { ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetDetailMobileActions } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileActions"
import { AssetDetailMobileModalBalances } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalances"
import { AssetDetailMobileModalBalancesHeader } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModalBalancesHeader"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal.styled"
import { AssetDetailTotal } from "@/modules/wallet/assets/MyAssets/AssetDetailTotal"
import { AssetOriginMobile } from "@/modules/wallet/assets/MyAssets/AssetOriginMobile"
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
        description={asset.name}
      />
      <SAssetDetailModalBody>
        <AssetDetailTotal assetId={asset.id} total={asset.total} />
        <AssetDetailMobileActions asset={asset} onModalOpen={onModalOpen} />
        {asset.origin?.name && (
          <>
            <SAssetDetailMobileSeparator />
            <AssetOriginMobile origin={asset.origin} />
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
      </SAssetDetailModalBody>
    </>
  )
}
