import { DialogTitle } from "@radix-ui/react-dialog"
import { Modal } from "components/Modal/Modal"
import { useAssets } from "providers/assets"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"
import { TransferModal } from "sections/pools/stablepool/transfer/TransferModal"
import { getAssetIdFromAddress } from "utils/evm"

export type SupplyGigaModalProps = {}

export const SupplyGigaModal = () => {
  const { type, close, args } = useModalContext()
  const { getRelatedAToken } = useAssets()
  const assetId = args?.underlyingAsset
    ? getAssetIdFromAddress(args.underlyingAsset)
    : ""

  const aTokenId = getRelatedAToken(assetId)?.id
  return (
    <Modal open={type === ModalType.GigaSupply} onClose={close}>
      <DialogTitle />
      {!!assetId && !!aTokenId && (
        <TransferModal
          poolId={assetId}
          onClose={close}
          stablepoolAssetId={aTokenId}
          farms={[]}
          skipOptions
          disabledOmnipool
          supply
        />
      )}
    </Modal>
  )
}
