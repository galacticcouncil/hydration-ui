
import React from "react"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { FaucetModalContent } from "./FaucetModalContent"

export const FaucetModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>

  return (
    <BasicModal open={type === ModalType.Faucet} setOpen={close}>
      <ModalWrapper
        title={<span>Faucet</span>}
        underlyingAsset={args.underlyingAsset}
      >
        {(params) => <FaucetModalContent {...params} />}
      </ModalWrapper>
    </BasicModal>
  )
}
