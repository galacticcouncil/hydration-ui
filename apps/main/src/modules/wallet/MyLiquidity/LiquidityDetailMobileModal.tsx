import { Modal, ModalHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { LiquidityDetailMobileModalBody } from "@/modules/wallet/MyLiquidity/LiquidityDetailMobileModalBody"
import {
  WalletLiquidityCurrentValue,
  WalletLiquidityPosition,
} from "@/modules/wallet/MyLiquidity/MyLiquidityTable.columns"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly currentValue: WalletLiquidityCurrentValue
  readonly positions: ReadonlyArray<WalletLiquidityPosition>
  readonly isOpen: boolean
  readonly onClose: () => void
}

export const LiquidityDetailMobileModal: FC<Props> = ({
  assetId,
  currentValue,
  positions,
  isOpen,
  onClose,
}) => {
  const { getAsset } = useAssets()
  const asset = getAsset(assetId)

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalHeader
        sx={{ p: 16 }}
        title={asset?.symbol ?? ""}
        description={asset?.name}
      />
      <LiquidityDetailMobileModalBody
        assetId={assetId}
        currentValue={currentValue}
        positions={positions}
      />
    </Modal>
  )
}
