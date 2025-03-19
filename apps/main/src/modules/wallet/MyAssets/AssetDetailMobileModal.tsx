import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { AssetDetailMobileModalBody } from "@/modules/wallet/MyAssets/AssetDetailMobileModalBody"
import { MyAsset } from "@/modules/wallet/MyAssets/MyAssetsTable.columns"

type Props = {
  readonly asset: MyAsset
  readonly isOpen: boolean
  readonly onClose: () => void
}

export const AssetDetailMobileModal: FC<Props> = ({
  asset,
  isOpen,
  onClose,
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset.symbol}
        description={asset.name}
      />
      <AssetDetailMobileModalBody asset={asset} />
    </Modal>
  )
}
