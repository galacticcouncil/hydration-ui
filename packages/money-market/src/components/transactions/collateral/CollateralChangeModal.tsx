import React from "react"

import { BasicModal } from "@/components/primitives"
import { TxModalWrapper } from "@/components/transactions/TxModalWrapper"
import { ModalContextType, ModalType, useModalContext } from "@/hooks/useModal"

import { CollateralChangeModalContent } from "./CollateralChangeModalContent"

export const CollateralChangeModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  return (
    <BasicModal
      open={type === ModalType.CollateralChange}
      setOpen={close}
      title="Change collateral"
    >
      <TxModalWrapper underlyingAsset={args.underlyingAsset}>
        {(params) => <CollateralChangeModalContent {...params} />}
      </TxModalWrapper>
    </BasicModal>
  )
}
