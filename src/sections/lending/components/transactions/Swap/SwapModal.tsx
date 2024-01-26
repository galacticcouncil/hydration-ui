import { Trans } from "@lingui/macro"
import React from "react"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"

import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { SwapModalContent } from "./SwapModalContent"

export const SwapModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
  }>
  return (
    <BasicModal open={type === ModalType.Swap} setOpen={close}>
      <ModalWrapper
        title={<span>Switch</span>}
        underlyingAsset={args.underlyingAsset}
      >
        {(params) => <SwapModalContent {...params} />}
      </ModalWrapper>
    </BasicModal>
  )
}
