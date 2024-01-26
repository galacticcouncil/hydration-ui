import { InterestRate } from "@aave/contract-helpers"
import { Trans } from "@lingui/macro"
import React from "react"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import {
  ModalContextType,
  ModalType,
  useModalContext,
} from "sections/lending/hooks/useModal"

import { ModalWrapper } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { DebtSwitchModalContent } from "./DebtSwitchModalContent"

export const DebtSwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string
    currentRateMode: InterestRate
  }>
  return (
    <BasicModal open={type === ModalType.DebtSwitch} setOpen={close}>
      <ModalWrapper
        title={<span>Switch borrow position</span>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => (
          <DebtSwitchModalContent
            {...params}
            currentRateMode={args.currentRateMode}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  )
}
