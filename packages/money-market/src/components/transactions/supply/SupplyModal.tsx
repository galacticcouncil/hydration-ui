import { PERMISSION } from "@aave/contract-helpers"

import { BasicModal } from "@/components/primitives/BasicModal"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { SupplyModalContent } from "./SupplyModalContent"

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close} title="Supply">
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
