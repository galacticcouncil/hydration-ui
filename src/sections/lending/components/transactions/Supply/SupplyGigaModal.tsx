import { DialogTitle } from "@radix-ui/react-dialog"
import { Modal } from "components/Modal/Modal"
import { ModalType, useModalContext } from "sections/lending/hooks/useModal"
import { SupplyAssetModal } from "sections/lending/ui/table/supply-assets/SupplyAssetModal"
import { getAssetIdFromAddress } from "utils/evm"

export type SupplyGigaModalProps = {}

export const SupplyGigaModal = () => {
  const { type, close, args } = useModalContext()
  return (
    <Modal open={type === ModalType.GigaSupply} onClose={close}>
      <DialogTitle />
      {!!args?.underlyingAsset && (
        <SupplyAssetModal
          assetId={getAssetIdFromAddress(args.underlyingAsset)}
          onClose={close}
        />
      )}
    </Modal>
  )
}
