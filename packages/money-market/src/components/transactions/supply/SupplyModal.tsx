import { PERMISSION } from "@aave/contract-helpers"

import { BasicModal } from "@/components/primitives/BasicModal"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { SupplyModalContent } from "./SupplyModalContent"

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
    symbol: string
  }>

  return (
    <BasicModal
      variant="popup"
      open={type === ModalType.Supply}
      setOpen={close}
      title={`Supply ${args.symbol}`}
    >
      <TxModalWrapper
        action="supply"
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => <SupplyModalContent {...params} />}
      </TxModalWrapper>
    </BasicModal>
  )
}
