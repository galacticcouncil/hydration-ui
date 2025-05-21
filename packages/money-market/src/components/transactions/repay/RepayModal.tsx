import { InterestRate, PERMISSION } from "@aave/contract-helpers"

import { BasicModal } from "@/components/primitives/BasicModal"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { RepayModalContent } from "./RepayModalContent"

export const RepayModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
    currentRateMode: InterestRate
    isFrozen: boolean
  }>

  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close} title="Repay">
      <TxModalWrapper
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) => (
          <RepayModalContent {...params} debtType={args.currentRateMode} />
        )}
      </TxModalWrapper>
    </BasicModal>
  )
}
